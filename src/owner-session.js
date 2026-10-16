// Browser visitors use the hosted ChatGPT sign-in; no bearer token is stored.
export const ownerSessionStore = { async read() { return null; }, async write() {}, async clear() {} };
