module.exports = function (api) {
  api.cache(true);

  const isJest = Boolean(process.env.JEST_WORKER_ID);

  const presets = ['babel-preset-expo'];

  if (!isJest) {
    presets.push('nativewind/babel');
  }

  return { presets };
};
