/**
 * AI PM Background Jobs — BullMQ worker for automated scanning.
 *
 * Jobs:
 * - scan-all-projects: Repeating every 60 min, scans all ACTIVE/ON_HOLD projects
 * - scan-project: One-off scan for a specific project (triggered by events)
 * - expire-insights: Daily at 2 AM, marks expired insights as DISMISSED
 *
 * Gracefully degrades — if no Redis, logs warning and skips.
 * All features still work via on-demand API.
 */
import { config } from '../config/index.js';
import { db } from '../config/database.js';
import { InsightStatus } from '../types/index.js';

// Dynamic import types for BullMQ
let Queue: any;
let Worker: any;
let QueueScheduler: any;

let scanQueue: any = null;
let scanWorker: any = null;
let isInitialized = false;

const SCAN_INTERVAL_MS = parseInt(process.env.AI_PM_SCAN_INTERVAL_MS || '3600000', 10); // 60 min default

/**
 * Initialize AI PM background jobs.
 * Safe to call even without Redis — will log warning and return.
 */
export async function initAIPMJobs(): Promise<void> {
  try {
    // Dynamic import to avoid crash if BullMQ has issues
    const bullmq = await import('bullmq') as any;
    Queue = bullmq.Queue || bullmq.default?.Queue;
    Worker = bullmq.Worker || bullmq.default?.Worker;
    if (!Queue || !Worker) throw new Error('BullMQ exports not found');
  } catch (err) {
    console.log('  AI PM background jobs: DISABLED (BullMQ not available)');
    return;
  }

  try {
    const redisUrl = config.redis.url;
    const url = new URL(redisUrl);
    const connection = {
      host: url.hostname,
      port: parseInt(url.port || '6379', 10),
      maxRetriesPerRequest: null,
    };

    // Test Redis connection with a timeout
    const ioredisModule = await import('ioredis') as any;
    const IORedisClass = ioredisModule.default || ioredisModule;
    const testClient = new IORedisClass({
      ...connection,
      lazyConnect: true,
      connectTimeout: 3000,
    });

    await Promise.race([
      testClient.connect(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Redis timeout')), 3000)),
    ]);
    await testClient.ping();
    await testClient.quit();

    // Redis is available — set up queues
    scanQueue = new Queue('ai-pm-scan', { connection });

    // Set up repeating jobs
    await scanQueue.add(
      'scan-all-projects',
      {},
      {
        repeat: { every: SCAN_INTERVAL_MS },
        removeOnComplete: 10,
        removeOnFail: 20,
      },
    );

    // Expire insights daily at 2 AM (approximated with repeat)
    await scanQueue.add(
      'expire-insights',
      {},
      {
        repeat: { every: 24 * 60 * 60 * 1000 }, // 24 hours
        removeOnComplete: 5,
        removeOnFail: 10,
      },
    );

    // Create worker
    scanWorker = new Worker(
      'ai-pm-scan',
      async (job: any) => {
        switch (job.name) {
          case 'scan-all-projects':
            await handleScanAllProjects();
            break;
          case 'scan-project':
            await handleScanProject(job.data.projectId);
            break;
          case 'expire-insights':
            await handleExpireInsights();
            break;
          default:
            console.log(`AI PM worker: unknown job ${job.name}`);
        }
      },
      {
        connection,
        concurrency: 1, // Sequential to avoid overloading AI API
      },
    );

    scanWorker.on('completed', (job: any) => {
      console.log(`  AI PM job completed: ${job.name}`);
    });

    scanWorker.on('failed', (job: any, err: Error) => {
      console.error(`  AI PM job failed: ${job?.name}`, err.message);
    });

    isInitialized = true;
    console.log(`  AI PM background jobs: ACTIVE (interval: ${SCAN_INTERVAL_MS / 1000}s)`);
  } catch (err: any) {
    console.log(`  AI PM background jobs: DISABLED (${err.message})`);
    scanQueue = null;
    scanWorker = null;
  }
}

/**
 * Enqueue a project scan (called by event triggers).
 * No-op if Redis/BullMQ not available.
 */
export async function enqueueProjectScan(projectId: string): Promise<void> {
  if (!scanQueue) return;

  try {
    // Deduplicate: don't enqueue if same project scan is already waiting
    const waiting = await scanQueue.getJobs(['waiting', 'active']);
    const alreadyQueued = waiting.some(
      (j: any) => j.name === 'scan-project' && j.data?.projectId === projectId,
    );

    if (!alreadyQueued) {
      await scanQueue.add('scan-project', { projectId }, {
        removeOnComplete: 20,
        removeOnFail: 10,
        delay: 5000, // 5 second delay to batch rapid-fire events
      });
    }
  } catch (err) {
    // Silently fail — on-demand API still works
  }
}

/**
 * Graceful shutdown.
 */
export async function shutdownAIPMJobs(): Promise<void> {
  if (scanWorker) {
    await scanWorker.close();
  }
  if (scanQueue) {
    await scanQueue.close();
  }
  isInitialized = false;
  console.log('  AI PM background jobs: shut down');
}

// ─── Job Handlers ────────────────────────────────────────

async function handleScanAllProjects(): Promise<void> {
  // Lazily import to avoid circular dependency
  const { scanProjectHealth } = await import('../services/aiPM.js');

  const projects = await db('projects')
    .whereIn('status', ['ACTIVE', 'ON_HOLD'])
    .select('id', 'name');

  console.log(`  AI PM scanning ${projects.length} active projects...`);

  for (const project of projects) {
    try {
      const insights = await scanProjectHealth(project.id);
      console.log(`    ${project.name}: ${insights.length} insight(s)`);
      // 2 second delay between projects to avoid rate limits
      await new Promise((r) => setTimeout(r, 2000));
    } catch (err: any) {
      console.error(`    ${project.name}: scan failed — ${err.message}`);
    }
  }
}

async function handleScanProject(projectId: string): Promise<void> {
  const { scanProjectHealth } = await import('../services/aiPM.js');

  try {
    const insights = await scanProjectHealth(projectId);
    console.log(`  AI PM scan-project ${projectId}: ${insights.length} insight(s)`);
  } catch (err: any) {
    console.error(`  AI PM scan-project ${projectId}: failed — ${err.message}`);
  }
}

async function handleExpireInsights(): Promise<void> {
  const expired = await db('ai_pm_insights')
    .where('status', InsightStatus.ACTIVE)
    .where('expires_at', '<', new Date())
    .update({
      status: InsightStatus.DISMISSED,
      updated_at: new Date(),
    });

  if (expired > 0) {
    console.log(`  AI PM expired ${expired} insight(s)`);
  }
}
