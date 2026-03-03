-- ============================================================
-- Roster Platform — Dev Seed Data
-- Three personas: CLIENT, CREATIVE (x8), PM
-- Plus: org, vault, rosters, projects
-- ============================================================

BEGIN;

-- ─── Organization ───
INSERT INTO organizations (id, name, domain, subscription_tier, industry, onboarding_completed_at) VALUES
  ('a0000000-0000-4000-8000-000000000001', 'Northstar Brands', 'northstarbrands.com', 'GROWTH', 'Consumer Brands', NOW());

-- ─── Brand Vault for Northstar ───
INSERT INTO brand_vaults (id, organization_id, completeness_score) VALUES
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 55);

-- ─── Users ───
-- CLIENT user (marketing director at Northstar)
INSERT INTO users (id, auth0_id, email, first_name, last_name, role, organization_id) VALUES
  ('c0000000-0000-4000-8000-000000000001', 'dev|client-sarah', 'sarah.chen@northstarbrands.com', 'Sarah', 'Chen', 'CLIENT', 'a0000000-0000-4000-8000-000000000001');

-- PM user (works for Roster)
INSERT INTO users (id, auth0_id, email, first_name, last_name, role, organization_id) VALUES
  ('c0000000-0000-4000-8000-000000000002', 'dev|pm-marcus', 'marcus.reeves@roster.io', 'Marcus', 'Reeves', 'PM', 'a0000000-0000-4000-8000-000000000001');

-- CREATIVE users (8 creatives across disciplines)
INSERT INTO users (id, auth0_id, email, first_name, last_name, role) VALUES
  ('c0000000-0000-4000-8000-000000000010', 'dev|creative-alex',   'alex.rivera@email.com',     'Alex',     'Rivera',    'CREATIVE'),
  ('c0000000-0000-4000-8000-000000000011', 'dev|creative-maya',   'maya.patel@email.com',      'Maya',     'Patel',     'CREATIVE'),
  ('c0000000-0000-4000-8000-000000000012', 'dev|creative-jordan', 'jordan.kwame@email.com',    'Jordan',   'Kwame',     'CREATIVE'),
  ('c0000000-0000-4000-8000-000000000013', 'dev|creative-elena',  'elena.voss@email.com',      'Elena',    'Voss',      'CREATIVE'),
  ('c0000000-0000-4000-8000-000000000014', 'dev|creative-sam',    'sam.tanaka@email.com',      'Sam',      'Tanaka',    'CREATIVE'),
  ('c0000000-0000-4000-8000-000000000015', 'dev|creative-nia',    'nia.okafor@email.com',      'Nia',      'Okafor',    'CREATIVE'),
  ('c0000000-0000-4000-8000-000000000016', 'dev|creative-liam',   'liam.forsythe@email.com',   'Liam',     'Forsythe',  'CREATIVE'),
  ('c0000000-0000-4000-8000-000000000017', 'dev|creative-priya',  'priya.sharma@email.com',    'Priya',    'Sharma',    'CREATIVE');

-- ─── Creative Profiles ───
INSERT INTO creative_profiles (id, user_id, bio, disciplines, experience_level, day_rate_cents, availability_status, tier, application_status, is_charter_member, projects_completed, average_rating, revision_policy) VALUES
  ('d0000000-0000-4000-8000-000000000010',
   'c0000000-0000-4000-8000-000000000010',
   'Award-winning brand designer with 10+ years shaping visual identities for Fortune 500 companies and ambitious startups. Specializes in systems thinking — building design languages that scale.',
   ARRAY['Design', 'Art Direction', 'Illustration'],
   'EXPERT', 85000, 'AVAILABLE', 'ELITE', 'APPROVED', true, 47, 4.90,
   'Two revision rounds included. Additional rounds at half day rate.'),

  ('d0000000-0000-4000-8000-000000000011',
   'c0000000-0000-4000-8000-000000000011',
   'Full-stack UX designer passionate about accessible, research-driven interfaces. Former design lead at a Series C fintech. Obsessed with micro-interactions and motion design.',
   ARRAY['UX', 'Design', 'Motion'],
   'SENIOR', 72000, 'AVAILABLE', 'PRO', 'APPROVED', true, 31, 4.85,
   'Unlimited minor revisions. Major direction changes billed hourly.'),

  ('d0000000-0000-4000-8000-000000000012',
   'c0000000-0000-4000-8000-000000000012',
   'Creative strategist and conceptual thinker. I turn brand ambiguity into actionable creative territories. Led integrated campaigns for Nike, Spotify, and three Cannes Lions entries.',
   ARRAY['Strategy', 'Copywriting', 'Art Direction'],
   'EXPERT', 95000, 'LIMITED', 'ELITE', 'APPROVED', false, 38, 4.95,
   'Strategy deliverables include one round of refinement.'),

  ('d0000000-0000-4000-8000-000000000013',
   'c0000000-0000-4000-8000-000000000013',
   'Copywriter and brand voice architect. I write headlines that stop thumbs and long-form that converts. Clients include Glossier, Mailchimp, and Warby Parker.',
   ARRAY['Copywriting', 'Strategy'],
   'SENIOR', 65000, 'AVAILABLE', 'PRO', 'APPROVED', false, 25, 4.70,
   'Two rounds of copy revisions included per deliverable.'),

  ('d0000000-0000-4000-8000-000000000014',
   'c0000000-0000-4000-8000-000000000014',
   'Motion designer and 3D generalist. Bringing brands to life through cinematic animation and interactive experiences. Fluent in After Effects, Cinema 4D, and Rive.',
   ARRAY['Motion', 'Design', 'Development'],
   'MID', 55000, 'AVAILABLE', 'MEMBER', 'APPROVED', false, 12, 4.60,
   'Standard — 2 rounds included.'),

  ('d0000000-0000-4000-8000-000000000015',
   'c0000000-0000-4000-8000-000000000015',
   'Commercial and editorial photographer with a documentary eye. Shoots for Vogue Business, Bloomberg, and emerging DTC brands looking for authentic visual storytelling.',
   ARRAY['Photography', 'Art Direction'],
   'SENIOR', 80000, 'UNAVAILABLE', 'PRO', 'APPROVED', true, 52, 4.88,
   'Includes shoot + basic retouching. Advanced editing billed separately.'),

  ('d0000000-0000-4000-8000-000000000016',
   'c0000000-0000-4000-8000-000000000016',
   'Front-end developer specializing in design systems and component libraries. React, TypeScript, Tailwind. I bridge the gap between design and engineering teams.',
   ARRAY['Development', 'UX', 'Design'],
   'SENIOR', 78000, 'AVAILABLE', 'PRO', 'APPROVED', false, 19, 4.75,
   'Bug fixes included for 30 days post-delivery.'),

  ('d0000000-0000-4000-8000-000000000017',
   'c0000000-0000-4000-8000-000000000017',
   'Illustrator and visual storyteller. Creates bespoke illustration systems, editorial art, and brand characters. Clients include The New York Times, Airbnb, and Headspace.',
   ARRAY['Illustration', 'Design', 'Art Direction'],
   'EXPERT', 88000, 'LIMITED', 'ELITE', 'APPROVED', true, 41, 4.92,
   'Concept sketches include 3 options. Final art: 2 revision rounds.');

-- ─── Brand Vault Assets ───
INSERT INTO brand_vault_assets (id, vault_id, asset_category, filename, file_type, s3_key, file_size_bytes, version, uploaded_by_user_id) VALUES
  ('e0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', 'logo', 'Northstar_Logo_Primary.svg', 'image/svg+xml', 'vaults/b0000000/e0000001/Northstar_Logo_Primary.svg', 28400, 2, 'c0000000-0000-4000-8000-000000000001'),
  ('e0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000001', 'logo', 'Northstar_Logo_White.png', 'image/png', 'vaults/b0000000/e0000002/Northstar_Logo_White.png', 145000, 1, 'c0000000-0000-4000-8000-000000000001'),
  ('e0000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000001', 'color_palette', 'Brand_Colors_2025.pdf', 'application/pdf', 'vaults/b0000000/e0000003/Brand_Colors_2025.pdf', 520000, 1, 'c0000000-0000-4000-8000-000000000001'),
  ('e0000000-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000001', 'typography', 'Typography_Guide.pdf', 'application/pdf', 'vaults/b0000000/e0000004/Typography_Guide.pdf', 1200000, 1, 'c0000000-0000-4000-8000-000000000001'),
  ('e0000000-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000001', 'guidelines', 'Northstar_Brand_Book_v3.pdf', 'application/pdf', 'vaults/b0000000/e0000005/Northstar_Brand_Book_v3.pdf', 8400000, 3, 'c0000000-0000-4000-8000-000000000001'),
  ('e0000000-0000-4000-8000-000000000006', 'b0000000-0000-4000-8000-000000000001', 'template', 'Social_Template_Pack.zip', 'application/zip', 'vaults/b0000000/e0000006/Social_Template_Pack.zip', 3200000, 1, 'c0000000-0000-4000-8000-000000000001');

-- ─── Rosters ───
INSERT INTO rosters (id, name, organization_id, created_by_user_id, is_saved) VALUES
  ('f0000000-0000-4000-8000-000000000001', 'Q1 Brand Refresh Team', 'a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001', true),
  ('f0000000-0000-4000-8000-000000000002', 'Summer Campaign Creatives', 'a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001', true),
  ('f0000000-0000-4000-8000-000000000003', 'Website Redesign Squad', 'a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001', false);

-- ─── Roster Members ───
-- Q1 Brand Refresh: Alex (Design Lead), Jordan (Strategy), Priya (Illustration), Nia (Photography backup)
INSERT INTO roster_members (id, roster_id, creative_profile_id, role_label, is_backup) VALUES
  ('f1000000-0000-4000-8000-000000000001', 'f0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000010', 'Lead Designer', false),
  ('f1000000-0000-4000-8000-000000000002', 'f0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000012', 'Strategist', false),
  ('f1000000-0000-4000-8000-000000000003', 'f0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000017', 'Illustrator', false),
  ('f1000000-0000-4000-8000-000000000004', 'f0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000015', 'Photographer', true);

-- Summer Campaign: Elena (Copy), Maya (UX), Sam (Motion)
INSERT INTO roster_members (id, roster_id, creative_profile_id, role_label, is_backup) VALUES
  ('f1000000-0000-4000-8000-000000000005', 'f0000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000013', 'Lead Copywriter', false),
  ('f1000000-0000-4000-8000-000000000006', 'f0000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000011', 'UX Designer', false),
  ('f1000000-0000-4000-8000-000000000007', 'f0000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000014', 'Motion Designer', false);

-- Website Redesign: Maya (UX Lead), Liam (Dev), Alex (Design)
INSERT INTO roster_members (id, roster_id, creative_profile_id, role_label, is_backup) VALUES
  ('f1000000-0000-4000-8000-000000000008', 'f0000000-0000-4000-8000-000000000003', 'd0000000-0000-4000-8000-000000000011', 'UX Lead', false),
  ('f1000000-0000-4000-8000-000000000009', 'f0000000-0000-4000-8000-000000000003', 'd0000000-0000-4000-8000-000000000016', 'Front-end Developer', false),
  ('f1000000-0000-4000-8000-000000000010', 'f0000000-0000-4000-8000-000000000003', 'd0000000-0000-4000-8000-000000000010', 'Visual Designer', false);

-- ─── Projects ───
INSERT INTO projects (id, organization_id, roster_id, pm_user_id, project_type, name, brief, status, health, budget_cents, due_date, started_at) VALUES
  ('10000000-0000-4000-8000-000000000001',
   'a0000000-0000-4000-8000-000000000001',
   'f0000000-0000-4000-8000-000000000001',
   'c0000000-0000-4000-8000-000000000002',
   'BRAND_IDENTITY',
   'Northstar Brand Refresh 2025',
   'Complete visual identity refresh including logo refinement, color system update, and comprehensive brand guidelines for print and digital.',
   'ACTIVE', 'GREEN', 12000000, '2025-04-15', '2025-01-20'),

  ('10000000-0000-4000-8000-000000000002',
   'a0000000-0000-4000-8000-000000000001',
   'f0000000-0000-4000-8000-000000000002',
   'c0000000-0000-4000-8000-000000000002',
   'CAMPAIGN_CONCEPT',
   'Summer ''25 Product Launch Campaign',
   'Multi-channel campaign concept for Q3 product launch. Includes digital ads, social content, email sequences, and landing page copy.',
   'ACTIVE', 'AMBER', 8500000, '2025-06-01', '2025-02-10'),

  ('10000000-0000-4000-8000-000000000003',
   'a0000000-0000-4000-8000-000000000001',
   NULL,
   NULL,
   'WEBSITE_REDESIGN',
   'Corporate Website Redesign',
   'Full redesign of northstarbrands.com. Mobile-first responsive design with headless CMS integration.',
   'DRAFT', 'GREEN', 18000000, '2025-08-01', NULL),

  ('10000000-0000-4000-8000-000000000004',
   'a0000000-0000-4000-8000-000000000001',
   NULL,
   'c0000000-0000-4000-8000-000000000002',
   'SOCIAL_CONTENT',
   'Instagram Rebrand Content Series',
   'Batch of 30 feed posts and 15 stories establishing new visual direction on Instagram.',
   'COMPLETED', 'GREEN', 4500000, '2025-01-15', '2024-11-01');

-- Mark completed project
UPDATE projects SET completed_at = '2025-01-14', spent_cents = 4200000 WHERE id = '10000000-0000-4000-8000-000000000004';
UPDATE projects SET spent_cents = 5800000 WHERE id = '10000000-0000-4000-8000-000000000001';
UPDATE projects SET spent_cents = 2100000 WHERE id = '10000000-0000-4000-8000-000000000002';

-- ─── AI PM Insights (sample data) ───
INSERT INTO ai_pm_insights (id, project_id, insight_type, severity, title, summary, details, recommendations, status, expires_at) VALUES
  ('20000000-0000-4000-8000-000000000001',
   '10000000-0000-4000-8000-000000000003',
   'BUDGET_ANALYSIS', 'WARNING',
   'Budget 48% consumed — monitor burn rate',
   'The Northstar Brand Refresh has spent $58,000 of $120,000 (48%). At the current burn rate, the budget will be fully consumed before the last two phases complete.',
   '{"percent_used": 48, "spent_cents": 5800000, "total_cents": 12000000, "burn_rate_per_day": 14600}',
   '["Track daily burn rate closely during Design Development phase", "Review costs before activating Brand Guidelines phase"]',
   'ACTIVE', NOW() + INTERVAL '7 days'),

  ('20000000-0000-4000-8000-000000000002',
   '10000000-0000-4000-8000-000000000003',
   'HEALTH_CHECK', 'INFO',
   'Project health is on track',
   'The Northstar Brand Refresh is progressing within expected parameters. Phase completion rate and deliverable quality are both healthy.',
   '{"health": "GREEN", "completed_phases": 2, "total_phases": 7}',
   '["Continue monitoring — no action needed"]',
   'ACTIVE', NOW() + INTERVAL '7 days'),

  ('20000000-0000-4000-8000-000000000003',
   '10000000-0000-4000-8000-000000000004',
   'TIMELINE_ALERT', 'CRITICAL',
   'Summer Campaign deadline at risk — 90 days remaining',
   'The Summer Product Launch Campaign has 4 active/pending phases with the June 1 deadline approaching. Current pace may not support all deliverables on time.',
   '{"days_remaining": 90, "pending_phases": 4, "due_date": "2025-06-01"}',
   '["Assess which phases can be fast-tracked or parallelized", "Discuss timeline extension or scope reduction with client"]',
   'ACTIVE', NOW() + INTERVAL '7 days'),

  ('20000000-0000-4000-8000-000000000004',
   '10000000-0000-4000-8000-000000000004',
   'RISK_DETECTION', 'WARNING',
   'Budget 25% consumed with most work ahead',
   'The campaign has spent $21,000 of $85,000 (25%), but the majority of production phases have not yet started. Budget allocation may need adjustment.',
   '{"percent_used": 25, "spent_cents": 2100000, "total_cents": 8500000}',
   '["Pre-allocate budget across remaining phases", "Identify potential cost savings in production"]',
   'ACTIVE', NOW() + INTERVAL '7 days');

COMMIT;
