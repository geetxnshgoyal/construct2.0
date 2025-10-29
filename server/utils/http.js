let cachedFetch = null;

const loadFetch = async () => {
  if (typeof fetch !== 'undefined') {
    return fetch;
  }
  if (cachedFetch) {
    return cachedFetch;
  }
  const module = await import('node-fetch');
  cachedFetch = module.default;
  return cachedFetch;
};

const callFetch = async (...args) => {
  const impl = await loadFetch();
  return impl(...args);
};

module.exports = {
  callFetch,
};
