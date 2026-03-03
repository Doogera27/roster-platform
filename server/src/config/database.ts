import knex from 'knex';
import { config } from './index.js';

export const db = knex({
  client: 'pg',
  connection: {
    connectionString: config.db.url,
    ssl: config.db.ssl ? { rejectUnauthorized: false } : false,
  },
  pool: {
    min: 2,
    max: 10,
  },
});
