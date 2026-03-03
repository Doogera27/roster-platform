/**
 * API client for the Roster backend.
 * Automatically attaches Auth0 Bearer token or dev user header.
 */
import axios from 'axios';
import { isAuth0Configured } from '../config';

export const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

// Dev mode: attach X-Dev-User-Id header from persisted state
if (!isAuth0Configured) {
  api.interceptors.request.use((config) => {
    try {
      const stored = localStorage.getItem('roster-dev-user');
      if (stored) {
        const parsed = JSON.parse(stored);
        const userId = parsed?.state?.currentUser?.id;
        if (userId) {
          config.headers['X-Dev-User-Id'] = userId;
        }
      }
    } catch {
      // ignore parse errors
    }
    return config;
  });
}

/**
 * Call this once during app init to set up the auth interceptor.
 */
export function configureApiAuth(getAccessTokenSilently: () => Promise<string>) {
  api.interceptors.request.use(async (config) => {
    try {
      const token = await getAccessTokenSilently();
      config.headers.Authorization = `Bearer ${token}`;
    } catch {
      // User not authenticated — request will be sent without token
    }
    return config;
  });
}
