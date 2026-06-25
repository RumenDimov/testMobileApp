module.exports = function (api) {
  api.cache(true);
  const presets = ['babel-preset-expo'];

  // nativewind/babel transforms className → style and rewrites JSX importSource.
  // Only needed for Metro bundling (dev/build), not for Jest tests.
  if (!process.env.JEST_WORKER_ID) {
    presets.push('nativewind/babel');
  }

  return { presets };
};
