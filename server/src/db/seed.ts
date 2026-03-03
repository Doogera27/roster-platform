/**
 * Database seed script.
 * Seeds workflow templates from Spec Section 6 and prompt templates from Section 5.
 *
 * Run with: npm run db:seed
 */
import { db } from '../config/database.js';

const workflowTemplates = [
  {
    project_type: 'BRAND_IDENTITY',
    name: 'Brand Identity',
    description: 'Full brand identity development from discovery to guidelines delivery.',
    estimated_total_duration_days: 42,
    recommended_roles: ['Strategist', 'Designer', 'Copywriter'],
    phases: [
      { name: 'Discovery', description: 'Client interviews, competitive audit, audience research', typical_duration_days: 5, required_roles: ['Strategist'], depends_on: [], deliverables: ['Discovery report'] },
      { name: 'Research', description: 'Market positioning analysis, brand landscape mapping', typical_duration_days: 5, required_roles: ['Strategist'], depends_on: [0], deliverables: ['Research deck'] },
      { name: 'Naming & Positioning', description: 'Brand naming exploration, positioning statement, messaging framework', typical_duration_days: 7, required_roles: ['Strategist', 'Copywriter'], depends_on: [1], deliverables: ['Naming options', 'Positioning statement'] },
      { name: 'Visual Concept', description: 'Mood boards, initial visual directions, logo concepts', typical_duration_days: 7, required_roles: ['Designer'], depends_on: [2], deliverables: ['Mood boards', 'Logo concepts'] },
      { name: 'Design Development', description: 'Refine selected direction, full identity system', typical_duration_days: 10, required_roles: ['Designer'], depends_on: [3], deliverables: ['Logo suite', 'Color palette', 'Typography system'] },
      { name: 'Brand Guidelines', description: 'Comprehensive brand guidelines document', typical_duration_days: 5, required_roles: ['Designer', 'Copywriter'], depends_on: [4], deliverables: ['Brand guidelines PDF'] },
      { name: 'Delivery', description: 'Final asset package and handoff', typical_duration_days: 3, required_roles: ['Designer'], depends_on: [5], deliverables: ['Asset package'] },
    ],
  },
  {
    project_type: 'CAMPAIGN_CONCEPT',
    name: 'Campaign Concepting',
    description: 'Creative campaign development from strategy through production-ready assets.',
    estimated_total_duration_days: 30,
    recommended_roles: ['Strategist', 'Copywriter', 'Designer'],
    phases: [
      { name: 'Strategy & Briefing', description: 'Campaign objectives, target audience, key messages', typical_duration_days: 4, required_roles: ['Strategist'], depends_on: [], deliverables: ['Campaign brief'] },
      { name: 'Creative Concepting', description: 'Big idea development, concept exploration', typical_duration_days: 7, required_roles: ['Copywriter', 'Designer'], depends_on: [0], deliverables: ['Concept presentations'] },
      { name: 'Copy Development', description: 'Headlines, body copy, taglines for selected concept', typical_duration_days: 5, required_roles: ['Copywriter'], depends_on: [1], deliverables: ['Copy deck'] },
      { name: 'Design Execution', description: 'Visual execution across required formats', typical_duration_days: 7, required_roles: ['Designer'], depends_on: [1], deliverables: ['Design comps'] },
      { name: 'Review', description: 'Internal and client review, revisions', typical_duration_days: 4, required_roles: ['Strategist'], depends_on: [2, 3], deliverables: ['Revised concepts'] },
      { name: 'Production-Ready Assets', description: 'Final files in all required formats and sizes', typical_duration_days: 3, required_roles: ['Designer'], depends_on: [4], deliverables: ['Production files'] },
    ],
  },
  {
    project_type: 'WEBSITE_REDESIGN',
    name: 'Website Redesign',
    description: 'Full website redesign from discovery through development handoff.',
    estimated_total_duration_days: 45,
    recommended_roles: ['UX Designer', 'Copywriter', 'Visual Designer'],
    phases: [
      { name: 'Discovery', description: 'Stakeholder interviews, analytics review, competitive audit', typical_duration_days: 5, required_roles: ['UX Designer'], depends_on: [], deliverables: ['Discovery report'] },
      { name: 'UX & Architecture', description: 'Sitemap, wireframes, user flows', typical_duration_days: 8, required_roles: ['UX Designer'], depends_on: [0], deliverables: ['Sitemap', 'Wireframes'] },
      { name: 'Copy', description: 'Page copy, microcopy, CTAs', typical_duration_days: 7, required_roles: ['Copywriter'], depends_on: [1], deliverables: ['Copy document'] },
      { name: 'Visual Design', description: 'High-fidelity mockups for all pages', typical_duration_days: 10, required_roles: ['Visual Designer'], depends_on: [1], deliverables: ['Design mockups'] },
      { name: 'Development Handoff', description: 'Design specs, assets, interaction notes for dev team', typical_duration_days: 5, required_roles: ['UX Designer', 'Visual Designer'], depends_on: [2, 3], deliverables: ['Dev handoff package'] },
      { name: 'QA', description: 'Design QA on implemented site', typical_duration_days: 5, required_roles: ['UX Designer'], depends_on: [4], deliverables: ['QA report'] },
      { name: 'Launch', description: 'Final review and launch support', typical_duration_days: 3, required_roles: ['UX Designer'], depends_on: [5], deliverables: ['Launch checklist'] },
    ],
  },
  {
    project_type: 'SOCIAL_CONTENT',
    name: 'Social Content',
    description: 'Social media content strategy and creation.',
    estimated_total_duration_days: 21,
    recommended_roles: ['Strategist', 'Copywriter', 'Designer', 'Motion Designer'],
    phases: [
      { name: 'Strategy', description: 'Content pillars, audience analysis, platform strategy', typical_duration_days: 4, required_roles: ['Strategist'], depends_on: [], deliverables: ['Social strategy'] },
      { name: 'Content Calendar', description: 'Monthly content calendar with post concepts', typical_duration_days: 3, required_roles: ['Strategist', 'Copywriter'], depends_on: [0], deliverables: ['Content calendar'] },
      { name: 'Copy', description: 'Post captions, hashtag strategy, CTAs', typical_duration_days: 4, required_roles: ['Copywriter'], depends_on: [1], deliverables: ['Copy document'] },
      { name: 'Design', description: 'Static post designs, carousel graphics, story templates', typical_duration_days: 5, required_roles: ['Designer'], depends_on: [1], deliverables: ['Design files'] },
      { name: 'Motion', description: 'Animated posts, Reels/TikTok content', typical_duration_days: 5, required_roles: ['Motion Designer'], depends_on: [3], deliverables: ['Motion files'] },
      { name: 'Scheduling', description: 'Final review and scheduling', typical_duration_days: 2, required_roles: ['Strategist'], depends_on: [2, 3], deliverables: ['Scheduled content'] },
    ],
  },
  {
    project_type: 'VIDEO_MOTION',
    name: 'Video / Motion',
    description: 'Video and motion graphics production.',
    estimated_total_duration_days: 28,
    recommended_roles: ['Copywriter', 'Storyboard Artist', 'Voiceover Artist', 'Motion Designer', 'Editor'],
    phases: [
      { name: 'Script', description: 'Video script and shot list', typical_duration_days: 5, required_roles: ['Copywriter'], depends_on: [], deliverables: ['Script'] },
      { name: 'Storyboard', description: 'Visual storyboard for the video', typical_duration_days: 4, required_roles: ['Storyboard Artist'], depends_on: [0], deliverables: ['Storyboard'] },
      { name: 'Voiceover & Audio', description: 'VO recording, music selection, sound design', typical_duration_days: 4, required_roles: ['Voiceover Artist'], depends_on: [0], deliverables: ['Audio files'] },
      { name: 'Design & Motion', description: 'Visual design and animation', typical_duration_days: 8, required_roles: ['Motion Designer'], depends_on: [1], deliverables: ['Motion graphics'] },
      { name: 'Edit', description: 'Assembly, pacing, color grading', typical_duration_days: 4, required_roles: ['Editor'], depends_on: [2, 3], deliverables: ['Final edit'] },
      { name: 'Delivery', description: 'Final renders in all required formats', typical_duration_days: 2, required_roles: ['Editor'], depends_on: [4], deliverables: ['Delivery package'] },
    ],
  },
  {
    project_type: 'EMAIL_CAMPAIGN',
    name: 'Email Campaign',
    description: 'Email marketing campaign from strategy through deployment.',
    estimated_total_duration_days: 21,
    recommended_roles: ['Strategist', 'Copywriter', 'Designer', 'Developer'],
    phases: [
      { name: 'Strategy', description: 'Campaign goals, audience segmentation, send schedule', typical_duration_days: 3, required_roles: ['Strategist'], depends_on: [], deliverables: ['Email strategy'] },
      { name: 'Copy', description: 'Subject lines, preview text, body copy, CTAs', typical_duration_days: 4, required_roles: ['Copywriter'], depends_on: [0], deliverables: ['Email copy'] },
      { name: 'Design', description: 'Email template design, header graphics', typical_duration_days: 4, required_roles: ['Designer'], depends_on: [0], deliverables: ['Email designs'] },
      { name: 'Development', description: 'HTML email coding, responsive templates', typical_duration_days: 4, required_roles: ['Developer'], depends_on: [1, 2], deliverables: ['HTML emails'] },
      { name: 'QA', description: 'Cross-client testing, link checks, rendering tests', typical_duration_days: 3, required_roles: ['Developer'], depends_on: [3], deliverables: ['QA report'] },
      { name: 'Deployment', description: 'ESP setup, list upload, send', typical_duration_days: 2, required_roles: ['Strategist'], depends_on: [4], deliverables: ['Deployment confirmation'] },
    ],
  },
  {
    project_type: 'PRINT_OOH',
    name: 'Print / OOH',
    description: 'Print and out-of-home advertising production.',
    estimated_total_duration_days: 25,
    recommended_roles: ['Copywriter', 'Designer'],
    phases: [
      { name: 'Brief', description: 'Creative brief, specs from vendor/printer', typical_duration_days: 3, required_roles: ['Copywriter'], depends_on: [], deliverables: ['Creative brief'] },
      { name: 'Copy', description: 'Headlines, body copy, legal', typical_duration_days: 4, required_roles: ['Copywriter'], depends_on: [0], deliverables: ['Copy deck'] },
      { name: 'Design', description: 'Layout design for all formats', typical_duration_days: 7, required_roles: ['Designer'], depends_on: [1], deliverables: ['Design comps'] },
      { name: 'Revision', description: 'Client review and revisions', typical_duration_days: 4, required_roles: ['Designer'], depends_on: [2], deliverables: ['Revised designs'] },
      { name: 'Pre-Press & Vendor Specs', description: 'Color proofs, vendor spec compliance', typical_duration_days: 3, required_roles: ['Designer'], depends_on: [3], deliverables: ['Pre-press proofs'] },
      { name: 'Print-Ready Files', description: 'Final print-ready production files', typical_duration_days: 2, required_roles: ['Designer'], depends_on: [4], deliverables: ['Print files'] },
    ],
  },
  {
    project_type: 'BRAND_PHOTOGRAPHY',
    name: 'Brand Photography',
    description: 'Brand photography from shot list through delivery.',
    estimated_total_duration_days: 21,
    recommended_roles: ['Photographer', 'Photo Editor', 'Art Director'],
    phases: [
      { name: 'Shot List', description: 'Shot list development, mood boards, location scouting', typical_duration_days: 4, required_roles: ['Art Director', 'Photographer'], depends_on: [], deliverables: ['Shot list', 'Mood board'] },
      { name: 'Pre-Production', description: 'Scheduling, talent casting, prop sourcing', typical_duration_days: 3, required_roles: ['Art Director'], depends_on: [0], deliverables: ['Production plan'] },
      { name: 'Shoot', description: 'Photography production day(s)', typical_duration_days: 2, required_roles: ['Photographer', 'Art Director'], depends_on: [1], deliverables: ['Raw photos'] },
      { name: 'Selects & Editing', description: 'Image selection and basic editing', typical_duration_days: 4, required_roles: ['Photo Editor'], depends_on: [2], deliverables: ['Photo selects'] },
      { name: 'Retouching', description: 'Advanced retouching on approved selects', typical_duration_days: 5, required_roles: ['Photo Editor'], depends_on: [3], deliverables: ['Retouched images'] },
      { name: 'Delivery', description: 'Final images in all required formats and resolutions', typical_duration_days: 2, required_roles: ['Photo Editor'], depends_on: [4], deliverables: ['Final image package'] },
    ],
  },
];

const promptTemplates = [
  {
    name: 'brief_parsing',
    operation_type: 'brief_parsing',
    model: 'claude',
    system_prompt: 'You are the Roster AI Project Manager. Your role is to analyze client project briefs and produce structured project plans. Be thorough, identify ambiguities, and propose realistic timelines.',
    user_prompt_template: `Analyze the following project brief and produce a structured analysis.

PROJECT TYPE: {{project_type}}
CLIENT BRIEF: {{brief}}
BRAND DATA: {{brand_data}}

Produce a JSON response with:
1. "summary": A plain-language 2-3 sentence summary of what the client wants
2. "deliverables": Array of expected deliverables
3. "ambiguities": Array of questions or unclear aspects that should be confirmed
4. "proposed_timeline_days": Estimated total timeline in business days
5. "phase_notes": Any notes about how the standard workflow template should be adjusted
6. "flagged_gaps": Any missing information that could cause delays`,
    output_schema: {
      type: 'object',
      properties: {
        summary: { type: 'string' },
        deliverables: { type: 'array', items: { type: 'string' } },
        ambiguities: { type: 'array', items: { type: 'string' } },
        proposed_timeline_days: { type: 'number' },
        phase_notes: { type: 'string' },
        flagged_gaps: { type: 'array', items: { type: 'string' } },
      },
    },
  },
  {
    name: 'creative_brief_generation',
    operation_type: 'creative_brief',
    model: 'claude',
    system_prompt: 'You are the Roster AI Project Manager. Generate a clear, actionable brief for a specific creative team member. Be concise, direct, and include all context they need to begin work. Never reference other team members\' work product or other phases.',
    user_prompt_template: `Generate a personalized creative brief for the following assignment.

ROLE: {{creative_role}}
PHASE: {{phase_name}}
PHASE DESCRIPTION: {{phase_description}}
EXPECTED DELIVERABLES: {{deliverables}}
PROJECT BRIEF: {{project_brief}}
BRAND DATA: {{brand_data}}

Write a professional, clear brief that this creative can immediately act on. Include:
1. What they need to produce
2. Key brand guidelines to follow
3. Timeline expectations
4. Any specific constraints or requirements`,
    output_schema: null,
  },
  {
    name: 'status_update_generation',
    operation_type: 'status_update',
    model: 'gpt4',
    system_prompt: 'You are the Roster AI Project Manager. Generate concise project status updates for the client. Be factual, clear, and professional. 3-5 sentences maximum.',
    user_prompt_template: `Generate a project status update based on the current state.

PROJECT: {{project_name}}
CURRENT PHASE: {{current_phases}}
DELIVERABLE STATUS: {{deliverable_status}}
UPCOMING MILESTONES: {{upcoming_milestones}}
BUDGET UTILIZATION: {{budget_utilization}}%

Write a 3-5 sentence status update for the project channel.`,
    output_schema: null,
  },
  {
    name: 'ai_pm_health_scan',
    operation_type: 'ai_pm_health_scan',
    model: 'claude',
    system_prompt: 'You are the Roster AI Project Manager. Analyze project data and produce actionable insights about health, risks, budget, and timeline. Each insight should have clear severity (CRITICAL/WARNING/INFO) and specific recommendations.',
    user_prompt_template: `Analyze the following project snapshot and produce health insights.\n\n{{project_snapshot}}\n\nReturn a JSON array of insight objects with: insight_type, severity, title, summary, details, recommendations.`,
    output_schema: null,
  },
  {
    name: 'ai_pm_status_report',
    operation_type: 'ai_pm_status_report',
    model: 'claude',
    system_prompt: 'You are the Roster AI Project Manager generating a status report for a PM to share with stakeholders. Be professional, concise, and actionable.',
    user_prompt_template: `Generate a comprehensive status report for this project.\n\n{{project_snapshot}}\n\nReturn a JSON object with: executive_summary, phase_status, budget_summary, risks, next_steps, overall_health.`,
    output_schema: null,
  },
  {
    name: 'ai_pm_budget_analysis',
    operation_type: 'ai_pm_budget_analysis',
    model: 'claude',
    system_prompt: 'You are the Roster AI Project Manager analyzing project budget health. Calculate burn rate, project costs forward, and identify optimization opportunities.',
    user_prompt_template: `Analyze budget health for this project.\n\n{{project_snapshot}}\n\nReturn a JSON object with: burn_rate_per_day_cents, projected_total_cents, runway_days, percent_used, status, recommendations, optimization_opportunities.`,
    output_schema: null,
  },
];

async function seed() {
  console.log('Seeding Roster database...');

  // Seed workflow templates
  for (const template of workflowTemplates) {
    const existing = await db('workflow_templates').where({ project_type: template.project_type }).first();
    if (!existing) {
      await db('workflow_templates').insert({
        ...template,
        phases: JSON.stringify(template.phases),
      });
      console.log(`  Seeded workflow template: ${template.name}`);
    } else {
      console.log(`  Skipped (exists): ${template.name}`);
    }
  }

  // Seed prompt templates
  for (const template of promptTemplates) {
    const existing = await db('prompt_templates').where({ name: template.name }).first();
    if (!existing) {
      await db('prompt_templates').insert({
        ...template,
        output_schema: template.output_schema ? JSON.stringify(template.output_schema) : null,
      });
      console.log(`  Seeded prompt template: ${template.name}`);
    } else {
      console.log(`  Skipped (exists): ${template.name}`);
    }
  }

  console.log('\nSeeding complete.');
  await db.destroy();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
