import { EMAIL_SERVICE_ORIGIN } from './email-api.mjs';

export function createNativeBankApi({ request = fetch, sessionStore, origin = EMAIL_SERVICE_ORIGIN, now = Date.now }) {
  if (!origin.startsWith('https://')) throw new Error('Banking requires HTTPS.');
  return async function bankApi(path, { method = 'GET', data, authenticated = true } = {}) {
    const headers = { Origin: origin };
    if (data !== undefined) headers['Content-Type'] = 'application/json';
    if (authenticated) {
      const session = await sessionStore.read();
      if (!session || session.expiresAt <= now() || !/^[a-f0-9]{64}$/.test(session.token || '')) {
        await sessionStore.clear();
        const error = new Error('Verify your email to manage bank connections.'); error.code = 'SIGN_IN_REQUIRED'; throw error;
      }
      headers.Authorization = `Bearer ${session.token}`;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 25000);
    try {
      const response = await request(`${origin}/api/${path}`, { method, credentials: 'omit', cache: 'no-store', headers,
        ...(data !== undefined ? { body: JSON.stringify(data) } : {}), signal: controller.signal });
      let result; try { result = await response.json(); } catch { throw new Error('The bank service could not be reached. Please try again.'); }
      if (!response.ok) {
        const error = new Error(result.error?.message || (typeof result.error === 'string' ? result.error : 'The bank action could not be completed.'));
        error.code = response.status === 401 ? 'SIGN_IN_REQUIRED' : result.error?.code;
        if (response.status === 401) await sessionStore.clear();
        throw error;
      }
      return result;
    } catch (error) {
      if (error.name === 'AbortError') throw new Error('The bank service took too long to respond. Please try again.');
      throw error;
    } finally { clearTimeout(timer); }
  };
}
