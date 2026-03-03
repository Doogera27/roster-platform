import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: process.env.NODE_ENV !== 'production',

  db: {
    url: process.env.DATABASE_URL || 'postgresql://roster:roster@localhost:5432/roster',
    ssl: process.env.DATABASE_SSL === 'true',
  },

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  auth0: {
    domain: process.env.AUTH0_DOMAIN || '',
    audience: process.env.AUTH0_AUDIENCE || '',
    clientId: process.env.AUTH0_CLIENT_ID || '',
    clientSecret: process.env.AUTH0_CLIENT_SECRET || '',
    mgmtClientId: process.env.AUTH0_MGMT_CLIENT_ID || '',
    mgmtClientSecret: process.env.AUTH0_MGMT_CLIENT_SECRET || '',
  },

  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    s3Bucket: process.env.AWS_S3_BUCKET || 'roster-assets',
    cloudfrontDomain: process.env.AWS_CLOUDFRONT_DOMAIN || '',
  },

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    connectClientId: process.env.STRIPE_CONNECT_CLIENT_ID || '',
  },

  stream: {
    apiKey: process.env.STREAM_API_KEY || '',
    apiSecret: process.env.STREAM_API_SECRET || '',
  },

  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
  },

  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY || '',
    fromEmail: process.env.SENDGRID_FROM_EMAIL || 'notifications@rosterteam.com',
  },

  sentry: {
    dsn: process.env.SENTRY_DSN || '',
  },
} as const;
