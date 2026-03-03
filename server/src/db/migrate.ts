/**
 * Database migration script.
 * Implements the full schema from Roster Technical Spec Section 3.
 *
 * Run with: npm run db:migrate
 */
import { db } from '../config/database.js';

async function migrate() {
  console.log('Running Roster database migrations...');

  // Enable uuid-ossp extension
  await db.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

  // ---- Organizations (must precede Users due to FK) ----
  if (!(await db.schema.hasTable('organizations'))) {
    await db.schema.createTable('organizations', (t) => {
      t.uuid('id').primary().defaultTo(db.raw('uuid_generate_v4()'));
      t.string('name').notNullable();
      t.string('domain');
      t.string('logo_url');
      t.enum('subscription_tier', ['STARTER', 'GROWTH', 'ENTERPRISE']).defaultTo('STARTER');
      t.string('stripe_customer_id');
      t.string('stripe_subscription_id');
      t.string('industry', 100);
      t.timestamp('onboarding_completed_at');
      t.timestamps(true, true);
    });
    console.log('  Created: organizations');
  }

  // ---- Organizations: add columns if missing (idempotent) ----
  if (await db.schema.hasTable('organizations')) {
    const hasCols = await db.schema.hasColumn('organizations', 'onboarding_completed_at');
    if (!hasCols) {
      await db.schema.alterTable('organizations', (t) => {
        t.string('industry', 100);
        t.timestamp('onboarding_completed_at');
      });
      console.log('  Altered: organizations (added industry, onboarding_completed_at)');
    }
  }

  // ---- Users ----
  if (!(await db.schema.hasTable('users'))) {
    await db.schema.createTable('users', (t) => {
      t.uuid('id').primary().defaultTo(db.raw('uuid_generate_v4()'));
      t.string('auth0_id').unique().notNullable();
      t.string('email').unique().notNullable();
      t.string('first_name').notNullable();
      t.string('last_name').notNullable();
      t.enum('role', ['CLIENT', 'CREATIVE', 'PM']).notNullable();
      t.string('avatar_url');
      t.uuid('organization_id').references('id').inTable('organizations').onDelete('SET NULL');
      t.boolean('is_active').defaultTo(true);
      t.timestamps(true, true);
    });
    console.log('  Created: users');
  }

  // ---- Creative Profiles ----
  if (!(await db.schema.hasTable('creative_profiles'))) {
    await db.schema.createTable('creative_profiles', (t) => {
      t.uuid('id').primary().defaultTo(db.raw('uuid_generate_v4()'));
      t.uuid('user_id').references('id').inTable('users').onDelete('CASCADE').unique().notNullable();
      t.text('bio').defaultTo('');
      t.specificType('disciplines', 'text[]').defaultTo('{}');
      t.specificType('portfolio_urls', 'text[]').defaultTo('{}');
      t.enum('experience_level', ['JUNIOR', 'MID', 'SENIOR', 'EXPERT']).defaultTo('MID');
      t.integer('day_rate_cents').defaultTo(0);
      t.decimal('rush_multiplier', 3, 2).defaultTo(1.5);
      t.text('revision_policy').defaultTo('');
      t.text('cancellation_terms').defaultTo('');
      t.jsonb('licensing_tiers').defaultTo('{}');
      t.enum('availability_status', ['AVAILABLE', 'LIMITED', 'UNAVAILABLE']).defaultTo('AVAILABLE');
      t.integer('max_concurrent_projects').defaultTo(3);
      t.enum('tier', ['MEMBER', 'PRO', 'ELITE']).defaultTo('MEMBER');
      t.enum('application_status', ['APPLIED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED']).defaultTo('APPLIED');
      t.text('application_notes');
      t.boolean('is_charter_member').defaultTo(false);
      t.integer('projects_completed').defaultTo(0);
      t.decimal('average_rating', 3, 2).defaultTo(0);
      t.decimal('re_engagement_rate', 5, 4).defaultTo(0);
      t.timestamps(true, true);
    });

    // Spec Section 3.3 index
    await db.raw(
      'CREATE INDEX idx_creative_profiles_search ON creative_profiles (availability_status, disciplines)'
    ).catch(() => {
      // Array columns may need GIN index instead
    });
    await db.raw(
      'CREATE INDEX idx_creative_profiles_disciplines ON creative_profiles USING GIN (disciplines)'
    );
    console.log('  Created: creative_profiles');
  }

  // ---- Portfolio Assets ----
  if (!(await db.schema.hasTable('portfolio_assets'))) {
    await db.schema.createTable('portfolio_assets', (t) => {
      t.uuid('id').primary().defaultTo(db.raw('uuid_generate_v4()'));
      t.uuid('creative_profile_id').references('id').inTable('creative_profiles').onDelete('CASCADE').notNullable();
      t.string('filename').notNullable();
      t.string('file_type').notNullable();
      t.string('s3_key').notNullable();
      t.integer('file_size_bytes').defaultTo(0);
      t.string('thumbnail_s3_key');
      t.integer('sort_order').defaultTo(0);
      t.timestamp('created_at').defaultTo(db.fn.now());
    });
    console.log('  Created: portfolio_assets');
  }

  // ---- Brand Vaults ----
  if (!(await db.schema.hasTable('brand_vaults'))) {
    await db.schema.createTable('brand_vaults', (t) => {
      t.uuid('id').primary().defaultTo(db.raw('uuid_generate_v4()'));
      t.uuid('organization_id').references('id').inTable('organizations').onDelete('CASCADE').unique().notNullable();
      t.decimal('completeness_score', 5, 2).defaultTo(0);
      t.timestamps(true, true);
    });
    console.log('  Created: brand_vaults');
  }

  // ---- Brand Vault Assets ----
  if (!(await db.schema.hasTable('brand_vault_assets'))) {
    await db.schema.createTable('brand_vault_assets', (t) => {
      t.uuid('id').primary().defaultTo(db.raw('uuid_generate_v4()'));
      t.uuid('vault_id').references('id').inTable('brand_vaults').onDelete('CASCADE').notNullable();
      t.string('filename').notNullable();
      t.string('file_type').notNullable();
      t.string('asset_category'); // brand_guidelines, logo, font, template, photography
      t.string('s3_key').notNullable();
      t.integer('file_size_bytes').defaultTo(0);
      t.integer('version').defaultTo(1);
      t.jsonb('extracted_brand_data');
      t.uuid('uploaded_by_user_id').references('id').inTable('users').onDelete('SET NULL');
      t.timestamp('created_at').defaultTo(db.fn.now());
    });
    console.log('  Created: brand_vault_assets');
  }

  // ---- Rosters ----
  if (!(await db.schema.hasTable('rosters'))) {
    await db.schema.createTable('rosters', (t) => {
      t.uuid('id').primary().defaultTo(db.raw('uuid_generate_v4()'));
      t.string('name').notNullable();
      t.uuid('organization_id').references('id').inTable('organizations').onDelete('CASCADE').notNullable();
      t.uuid('created_by_user_id').references('id').inTable('users').onDelete('SET NULL');
      t.text('notes');
      t.boolean('is_saved').defaultTo(false);
      t.timestamps(true, true);
    });
    console.log('  Created: rosters');
  }

  // ---- Roster Members ----
  if (!(await db.schema.hasTable('roster_members'))) {
    await db.schema.createTable('roster_members', (t) => {
      t.uuid('id').primary().defaultTo(db.raw('uuid_generate_v4()'));
      t.uuid('roster_id').references('id').inTable('rosters').onDelete('CASCADE').notNullable();
      t.uuid('creative_profile_id').references('id').inTable('creative_profiles').onDelete('CASCADE').notNullable();
      t.string('role_label').notNullable();
      t.text('annotation');
      t.boolean('is_backup').defaultTo(false);
      t.timestamp('added_at').defaultTo(db.fn.now());
      t.unique(['roster_id', 'creative_profile_id', 'is_backup']);
    });
    console.log('  Created: roster_members');
  }

  // ---- Projects ----
  if (!(await db.schema.hasTable('projects'))) {
    await db.schema.createTable('projects', (t) => {
      t.uuid('id').primary().defaultTo(db.raw('uuid_generate_v4()'));
      t.uuid('organization_id').references('id').inTable('organizations').onDelete('CASCADE').notNullable();
      t.uuid('roster_id').references('id').inTable('rosters').onDelete('SET NULL');
      t.uuid('pm_user_id').references('id').inTable('users').onDelete('SET NULL');
      t.enum('project_type', [
        'BRAND_IDENTITY', 'CAMPAIGN_CONCEPT', 'WEBSITE_REDESIGN',
        'SOCIAL_CONTENT', 'VIDEO_MOTION', 'EMAIL_CAMPAIGN',
        'PRINT_OOH', 'BRAND_PHOTOGRAPHY',
      ]).notNullable();
      t.string('name').notNullable();
      t.text('brief').defaultTo('');
      t.enum('status', ['DRAFT', 'PENDING_CONFIRMATION', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED']).defaultTo('DRAFT');
      t.enum('health', ['GREEN', 'AMBER', 'RED']).defaultTo('GREEN');
      t.bigInteger('budget_cents').defaultTo(0);
      t.bigInteger('spent_cents').defaultTo(0);
      t.date('due_date');
      t.timestamp('started_at');
      t.timestamp('completed_at');
      t.timestamps(true, true);
    });

    // Spec Section 3.3 index
    await db.raw('CREATE INDEX idx_projects_org_status ON projects (organization_id, status)');
    console.log('  Created: projects');
  }

  // ---- Project Phases (DAG — Spec Section 3.2) ----
  if (!(await db.schema.hasTable('project_phases'))) {
    await db.schema.createTable('project_phases', (t) => {
      t.uuid('id').primary().defaultTo(db.raw('uuid_generate_v4()'));
      t.uuid('project_id').references('id').inTable('projects').onDelete('CASCADE').notNullable();
      t.string('name').notNullable();
      t.text('description').defaultTo('');
      t.specificType('depends_on', 'uuid[]').defaultTo('{}'); // DAG adjacency list
      t.enum('status', ['PENDING', 'ACTIVE', 'COMPLETE', 'BLOCKED']).defaultTo('PENDING');
      t.uuid('assigned_creative_id').references('id').inTable('creative_profiles').onDelete('SET NULL');
      t.integer('typical_duration_days').defaultTo(5);
      t.timestamp('brief_delivered_at');
      t.timestamp('activated_at');
      t.timestamp('completed_at');
      t.integer('sort_order').defaultTo(0);
      t.timestamps(true, true);
    });

    // Spec Section 3.3 index
    await db.raw('CREATE INDEX idx_project_phases_status ON project_phases (project_id, status)');
    console.log('  Created: project_phases');
  }

  // ---- Tasks ----
  if (!(await db.schema.hasTable('tasks'))) {
    await db.schema.createTable('tasks', (t) => {
      t.uuid('id').primary().defaultTo(db.raw('uuid_generate_v4()'));
      t.uuid('phase_id').references('id').inTable('project_phases').onDelete('CASCADE').notNullable();
      t.uuid('assigned_creative_id').references('id').inTable('creative_profiles').onDelete('SET NULL');
      t.string('title').notNullable();
      t.text('description').defaultTo('');
      t.boolean('is_complete').defaultTo(false);
      t.date('due_date');
      t.timestamps(true, true);
    });
    console.log('  Created: tasks');
  }

  // ---- Deliverables ----
  if (!(await db.schema.hasTable('deliverables'))) {
    await db.schema.createTable('deliverables', (t) => {
      t.uuid('id').primary().defaultTo(db.raw('uuid_generate_v4()'));
      t.uuid('phase_id').references('id').inTable('project_phases').onDelete('CASCADE').notNullable();
      t.uuid('task_id').references('id').inTable('tasks').onDelete('SET NULL');
      t.uuid('submitted_by_user_id').references('id').inTable('users').onDelete('SET NULL');
      t.string('title').notNullable();
      t.string('file_s3_key');
      t.string('file_type');
      t.enum('status', ['PENDING', 'SUBMITTED', 'IN_REVIEW', 'APPROVED', 'REVISION_REQUESTED']).defaultTo('PENDING');
      t.integer('revision_number').defaultTo(1);
      t.text('feedback');
      t.uuid('reviewed_by_user_id').references('id').inTable('users').onDelete('SET NULL');
      t.timestamp('reviewed_at');
      t.timestamps(true, true);
    });

    // Spec Section 3.3 index
    await db.raw('CREATE INDEX idx_deliverables_review ON deliverables (phase_id, status)');
    console.log('  Created: deliverables');
  }

  // ---- Invoices ----
  if (!(await db.schema.hasTable('invoices'))) {
    await db.schema.createTable('invoices', (t) => {
      t.uuid('id').primary().defaultTo(db.raw('uuid_generate_v4()'));
      t.uuid('project_id').references('id').inTable('projects').onDelete('CASCADE').notNullable();
      t.uuid('organization_id').references('id').inTable('organizations').onDelete('CASCADE').notNullable();
      t.string('stripe_invoice_id');
      t.bigInteger('amount_cents').defaultTo(0);
      t.bigInteger('platform_fee_cents').defaultTo(0);
      t.enum('status', ['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED']).defaultTo('DRAFT');
      t.string('pdf_s3_key');
      t.date('due_date');
      t.timestamp('paid_at');
      t.timestamps(true, true);
    });
    console.log('  Created: invoices');
  }

  // ---- Ratings ----
  if (!(await db.schema.hasTable('ratings'))) {
    await db.schema.createTable('ratings', (t) => {
      t.uuid('id').primary().defaultTo(db.raw('uuid_generate_v4()'));
      t.uuid('project_id').references('id').inTable('projects').onDelete('CASCADE').notNullable();
      t.uuid('reviewer_user_id').references('id').inTable('users').onDelete('CASCADE').notNullable();
      t.uuid('reviewed_user_id').references('id').inTable('users').onDelete('CASCADE').notNullable();
      t.integer('score').notNullable(); // 1-5
      t.text('comment');
      t.timestamp('created_at').defaultTo(db.fn.now());
      t.unique(['project_id', 'reviewer_user_id', 'reviewed_user_id']);
    });

    // Spec Section 3.3 index
    await db.raw('CREATE INDEX idx_ratings_creative ON ratings (reviewed_user_id, created_at)');
    console.log('  Created: ratings');
  }

  // ---- Workflow Templates (Spec Section 6) ----
  if (!(await db.schema.hasTable('workflow_templates'))) {
    await db.schema.createTable('workflow_templates', (t) => {
      t.uuid('id').primary().defaultTo(db.raw('uuid_generate_v4()'));
      t.string('project_type').unique().notNullable();
      t.string('name').notNullable();
      t.text('description').defaultTo('');
      t.jsonb('phases').notNullable(); // Array of phase definitions
      t.integer('estimated_total_duration_days').defaultTo(30);
      t.specificType('recommended_roles', 'text[]').defaultTo('{}');
      t.boolean('is_active').defaultTo(true);
      t.timestamps(true, true);
    });
    console.log('  Created: workflow_templates');
  }

  // ---- AI Prompt Templates (Spec Section 5.3) ----
  if (!(await db.schema.hasTable('prompt_templates'))) {
    await db.schema.createTable('prompt_templates', (t) => {
      t.uuid('id').primary().defaultTo(db.raw('uuid_generate_v4()'));
      t.string('name').unique().notNullable();
      t.string('operation_type').notNullable(); // brief_parsing, creative_brief, status_update, change_order, escalation
      t.text('system_prompt').notNullable();
      t.text('user_prompt_template').notNullable();
      t.string('model').defaultTo('claude'); // claude | gpt4
      t.jsonb('output_schema'); // Expected JSON output format
      t.integer('version').defaultTo(1);
      t.boolean('is_active').defaultTo(true);
      t.timestamps(true, true);
    });
    console.log('  Created: prompt_templates');
  }

  // ---- AI Operation Log (Spec Section 5.3) ----
  if (!(await db.schema.hasTable('ai_operation_logs'))) {
    await db.schema.createTable('ai_operation_logs', (t) => {
      t.uuid('id').primary().defaultTo(db.raw('uuid_generate_v4()'));
      t.uuid('prompt_template_id').references('id').inTable('prompt_templates').onDelete('SET NULL');
      t.uuid('project_id').references('id').inTable('projects').onDelete('SET NULL');
      t.string('operation_type').notNullable();
      t.string('model_used').notNullable();
      t.text('input_hash');
      t.jsonb('input_data');
      t.jsonb('output_data');
      t.integer('prompt_version');
      t.integer('input_tokens');
      t.integer('output_tokens');
      t.integer('latency_ms');
      t.integer('quality_rating'); // 1-5, rated by PM
      t.uuid('rated_by_user_id').references('id').inTable('users').onDelete('SET NULL');
      t.timestamp('created_at').defaultTo(db.fn.now());
    });
    console.log('  Created: ai_operation_logs');
  }

  // ---- Saved Collaborators (Spec Section 4.2, System 02) ----
  if (!(await db.schema.hasTable('saved_collaborators'))) {
    await db.schema.createTable('saved_collaborators', (t) => {
      t.uuid('id').primary().defaultTo(db.raw('uuid_generate_v4()'));
      t.uuid('creative_profile_id').references('id').inTable('creative_profiles').onDelete('CASCADE').notNullable();
      t.uuid('collaborator_profile_id').references('id').inTable('creative_profiles').onDelete('CASCADE').notNullable();
      t.timestamp('created_at').defaultTo(db.fn.now());
      t.unique(['creative_profile_id', 'collaborator_profile_id']);
    });
    console.log('  Created: saved_collaborators');
  }

  // ---- Change Orders ----
  if (!(await db.schema.hasTable('change_orders'))) {
    await db.schema.createTable('change_orders', (t) => {
      t.uuid('id').primary().defaultTo(db.raw('uuid_generate_v4()'));
      t.uuid('project_id').references('id').inTable('projects').onDelete('CASCADE').notNullable();
      t.text('description').notNullable();
      t.bigInteger('amount_cents').defaultTo(0);
      t.enum('status', ['PENDING', 'APPROVED', 'REJECTED']).defaultTo('PENDING');
      t.uuid('requested_by_user_id').references('id').inTable('users').onDelete('SET NULL');
      t.uuid('approved_by_user_id').references('id').inTable('users').onDelete('SET NULL');
      t.timestamp('approved_at');
      t.timestamps(true, true);
    });
    console.log('  Created: change_orders');
  }

  // ---- Notifications ----
  if (!(await db.schema.hasTable('notifications'))) {
    await db.schema.createTable('notifications', (t) => {
      t.uuid('id').primary().defaultTo(db.raw('uuid_generate_v4()'));
      t.uuid('user_id').references('id').inTable('users').onDelete('CASCADE').notNullable();
      t.string('type').notNullable();
      t.string('title').notNullable();
      t.text('body');
      t.string('link');
      t.uuid('project_id').references('id').inTable('projects').onDelete('SET NULL');
      t.boolean('is_read').defaultTo(false);
      t.timestamps(true, true);
    });
    await db.raw('CREATE INDEX idx_notifications_user ON notifications (user_id, is_read, created_at DESC)');
    console.log('  Created: notifications');
  }

  // ---- Activity Feed ----
  if (!(await db.schema.hasTable('activity_feed'))) {
    await db.schema.createTable('activity_feed', (t) => {
      t.uuid('id').primary().defaultTo(db.raw('uuid_generate_v4()'));
      t.uuid('project_id').references('id').inTable('projects').onDelete('CASCADE').notNullable();
      t.uuid('user_id').references('id').inTable('users').onDelete('SET NULL');
      t.string('type').notNullable();
      t.string('title').notNullable();
      t.text('body');
      t.jsonb('metadata').defaultTo('{}');
      t.timestamps(true, true);
    });
    await db.raw('CREATE INDEX idx_activity_feed_project ON activity_feed (project_id, created_at DESC)');
    console.log('  Created: activity_feed');
  }

  // ---- AI PM Insights ----
  if (!(await db.schema.hasTable('ai_pm_insights'))) {
    await db.schema.createTable('ai_pm_insights', (t) => {
      t.uuid('id').primary().defaultTo(db.raw('uuid_generate_v4()'));
      t.uuid('project_id').references('id').inTable('projects').onDelete('CASCADE').notNullable();
      t.string('insight_type').notNullable(); // HEALTH_CHECK, RISK_DETECTION, BUDGET_ANALYSIS, etc.
      t.string('severity').notNullable().defaultTo('INFO'); // INFO, WARNING, CRITICAL
      t.string('title').notNullable();
      t.text('summary');
      t.jsonb('details').defaultTo('{}');
      t.jsonb('recommendations').defaultTo('[]');
      t.string('status').notNullable().defaultTo('ACTIVE'); // ACTIVE, ACKNOWLEDGED, RESOLVED, DISMISSED
      t.uuid('acknowledged_by_user_id').references('id').inTable('users').onDelete('SET NULL');
      t.timestamp('acknowledged_at');
      t.uuid('resolved_by_user_id').references('id').inTable('users').onDelete('SET NULL');
      t.timestamp('resolved_at');
      t.timestamp('expires_at');
      t.timestamps(true, true);
    });
    await db.raw('CREATE INDEX idx_ai_pm_insights_project ON ai_pm_insights (project_id, status)');
    await db.raw('CREATE INDEX idx_ai_pm_insights_type ON ai_pm_insights (insight_type, severity)');
    console.log('  Created: ai_pm_insights');
  }

  console.log('\nAll migrations complete.');
  await db.destroy();
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
