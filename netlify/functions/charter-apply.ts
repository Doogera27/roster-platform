import type { Handler, HandlerEvent } from '@netlify/functions';
import { Client } from '@notionhq/client';

/* ─── Invite code registry (duplicated server-side for validation) ─── */
const VALID_INVITE_CODES = new Set([
  'sarah-c',
  'mike-r',
  'jess-t',
  'alex-m',
  'dana-w',
]);

/* ─── Notion setup ─── */
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DATABASE_ID = process.env.NOTION_CHARTER_DB_ID || 'b5cd8db6ea4c4ce080da97ddefad5806';

/* ─── Types ─── */
interface ApplicationPayload {
  firstName: string;
  lastName: string;
  email: string;
  portfolio: string;
  location: string;
  primarySpecialty: string;
  otherSpecialties: string[];
  experience: string;
  sampleWork?: string;
  bio: string;
  howKnowZach: string;
  inviteCode: string;
}

/* ─── Validation ─── */
function validate(body: ApplicationPayload): string | null {
  if (!body.firstName?.trim()) return 'First name is required.';
  if (!body.lastName?.trim()) return 'Last name is required.';
  if (!body.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email))
    return 'A valid email address is required.';
  if (!body.portfolio?.trim()) return 'Portfolio URL is required.';
  if (!body.location?.trim()) return 'Location is required.';
  if (!body.primarySpecialty?.trim()) return 'Primary specialty is required.';
  if (!body.experience?.trim()) return 'Years of experience is required.';
  if (!body.bio?.trim()) return 'A short bio is required.';
  if (!body.howKnowZach?.trim()) return '"How do you know Zach?" is required.';
  if (!body.inviteCode || !VALID_INVITE_CODES.has(body.inviteCode))
    return 'Invalid invite code.';
  return null;
}

/* ─── Handler ─── */
const handler: Handler = async (event: HandlerEvent) => {
  /* CORS headers */
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  /* Preflight */
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  /* Only POST */
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed.' }),
    };
  }

  try {
    const body: ApplicationPayload = JSON.parse(event.body || '{}');

    /* Validate */
    const error = validate(body);
    if (error) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error }),
      };
    }

    /* Create Notion page */
    await notion.pages.create({
      parent: { database_id: DATABASE_ID },
      properties: {
        Name: {
          title: [{ text: { content: `${body.firstName.trim()} ${body.lastName.trim()}` } }],
        },
        Email: {
          email: body.email.trim(),
        },
        'Portfolio URL': {
          url: body.portfolio.trim(),
        },
        Location: {
          rich_text: [{ text: { content: body.location.trim() } }],
        },
        'Primary Specialty': {
          select: { name: body.primarySpecialty },
        },
        'Other Specialties': {
          multi_select: (body.otherSpecialties || []).map((s) => ({ name: s })),
        },
        'Years of Experience': {
          select: { name: body.experience },
        },
        ...(body.sampleWork?.trim()
          ? { 'Sample Work URL': { url: body.sampleWork.trim() } }
          : {}),
        Bio: {
          rich_text: [{ text: { content: body.bio.trim().slice(0, 2000) } }],
        },
        'How They Know Zach': {
          rich_text: [{ text: { content: body.howKnowZach.trim().slice(0, 2000) } }],
        },
        'Invite Code': {
          rich_text: [{ text: { content: body.inviteCode } }],
        },
        Status: {
          select: { name: 'New' },
        },
        'Applied At': {
          date: { start: new Date().toISOString() },
        },
      },
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true }),
    };
  } catch (err: unknown) {
    console.error('Charter apply error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Something went wrong submitting your application. Please try again.',
      }),
    };
  }
};

export { handler };
