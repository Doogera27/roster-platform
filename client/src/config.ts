/**
 * Client-side configuration.
 * Auth0 is considered unconfigured when env vars are empty or placeholders.
 */
const auth0Domain = import.meta.env.VITE_AUTH0_DOMAIN || '';
const auth0ClientId = import.meta.env.VITE_AUTH0_CLIENT_ID || '';
const auth0Audience = import.meta.env.VITE_AUTH0_AUDIENCE || '';

export const isAuth0Configured =
  !!auth0Domain &&
  auth0Domain !== 'your-tenant.us.auth0.com' &&
  !!auth0ClientId &&
  auth0ClientId !== 'your-client-id';

export const auth0Config = {
  domain: auth0Domain,
  clientId: auth0ClientId,
  audience: auth0Audience,
};
