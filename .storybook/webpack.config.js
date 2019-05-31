// Export a function. Accept the base config as the only param.
module.exports = async ({ config, mode }) => {
  // Fixes issues with @reactioncommerce/logger as it needs "node" packages to run
  config.node = { fs: "empty", tls: "empty", net: "empty", module: "empty", console: true };

  config.module.rules.push({
    test: /\.stories\.jsx?$/,
    loaders: [require.resolve("@storybook/addon-storysource/loader")],
    enforce: "pre",
  });

  // Return the altered config
  return config;
};