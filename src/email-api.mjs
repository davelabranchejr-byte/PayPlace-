// Public service address only. Resend credentials stay on the server.
export const EMAIL_SERVICE_ORIGIN = 'https://payplace-dave.davelabranchejr.chatgpt.site';
export function createEmailApi(platform, request = fetch) {
  return async function emailApi(path, data) {
    const native = platform !== 'web';
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    try {
      const headers = data ? { 'Content-Type': 'application/json' } : {};
      // Native fetch has no browser Origin. Use the service's expected public origin.
      if (native) headers.Origin = EMAIL_SERVICE_ORIGIN;
      const result = await request(`${native ? EMAIL_SERVICE_ORIGIN : ''}/api/email/${path}`, {
        method: data ? 'POST' : 'GET', credentials: native ? 'omit' : 'same-origin',
        headers, body: data ? JSON.stringify(data) : undefined, signal: controller.signal,
      });
      let payload;
      try { payload = await result.json(); }
      catch { throw new Error('The post office could not be reached. Please try again shortly.'); }
      if (!result.ok) throw new Error(payload.error || 'Please try again shortly.');
      return payload;
    } catch (error) {
      if (error.name === 'AbortError') throw new Error('The post office took too long to respond. Please try again.');
      throw error;
    } finally { clearTimeout(timer); }
  };
}
