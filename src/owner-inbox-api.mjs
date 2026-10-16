import { EMAIL_SERVICE_ORIGIN } from './email-api.mjs';
export function createOwnerInboxApi({ sessionStore, request = fetch, origin = EMAIL_SERVICE_ORIGIN, now = Date.now }) {
  return async (path, data, authenticated = true) => {
    const headers = { Origin: origin };
    if (data !== undefined) headers['Content-Type'] = 'application/json';
    if (authenticated) {
      const session = await sessionStore.read();
      if (!session || !/^[a-f0-9]{64}$/.test(session.token || '') || !Number.isFinite(session.expiresAt) || session.expiresAt <= now()) {
        await sessionStore.clear(); const error = new Error('Verify your owner email to open the inbox.'); error.signIn = true; throw error;
      }
      headers.Authorization = 'Bearer ' + session.token;
    }
    const controller = new AbortController(), timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await request(`${origin}/api/cabaret-owner/${path}`, { method: data === undefined ? 'GET' : 'POST', credentials: 'omit', cache: 'no-store', headers, ...(data === undefined ? {} : { body: JSON.stringify(data) }), signal: controller.signal });
      let result; try { result = await response.json(); } catch { throw new Error('The owner inbox could not be reached. Please try again.'); }
      if (!response.ok) { const error = new Error(result.error || 'The inbox action could not be completed.'); error.signIn = response.status === 401; if (error.signIn) await sessionStore.clear(); throw error; }
      return result;
    } catch (error) { if (error.name === 'AbortError') throw new Error('The owner inbox took too long to respond. Please try again.'); throw error; }
    finally { clearTimeout(timeout); }
  };
}
