export const simpleSchemas = {};

/**
 * @summary Will be called for every plugin
 * @param {Object} options The options object that the plugin passed to registerPackage
 * @returns {undefined}
 */
export function registerPluginHandler({ name, simpleSchemas: pluginSimpleSchemas }) {
  if (pluginSimpleSchemas) {
    Object.keys(pluginSimpleSchemas).forEach((key) => {
      if (simpleSchemas[key]) {
        throw new Error(`Plugin "${name}" tried to register a SimpleSchema as "${key}" but another plugin has already taken that name.`);
      }
      simpleSchemas[key] = pluginSimpleSchemas[key];
    });
  }
}
