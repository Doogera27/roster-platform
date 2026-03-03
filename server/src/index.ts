import { app } from './app.js';
import { config } from './config/index.js';
import { initAIPMJobs, shutdownAIPMJobs } from './jobs/aiPMWorker.js';

const server = app.listen(config.port, () => {
  console.log(`Roster API running on port ${config.port} [${config.nodeEnv}]`);

  // Initialize background jobs after server starts
  initAIPMJobs().catch((err) => {
    console.error('Failed to init AI PM jobs:', err.message);
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down...');
  await shutdownAIPMJobs();
  server.close(() => process.exit(0));
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Shutting down...');
  await shutdownAIPMJobs();
  server.close(() => process.exit(0));
});
