import path from "path";
import stack from "callsite";
import Logger from "@reactioncommerce/logger";

/**
 * @summary Import all plugins listed in a JSON file. Relative paths are assumed
 *   to be relative to the JSON file. This does NOT register the plugins. It builds
 *   a valid `plugins` object which you can then pass to `api.registerPlugins`.
 * @param {Object} pluginsFile An absolute or relative file path for a JSON file.
 * @param {Function} [transformPlugins] A function that takes the loaded plugins object and
 *   may return an altered plugins object.
 * @returns {Promise<Object>} Plugins object suitable for `api.registerPlugins`
 */
export default async function importPluginsJSONFile(pluginsFile, transformPlugins) {
  let absolutePluginsFile;
  if (path.isAbsolute(pluginsFile)) {
    absolutePluginsFile = pluginsFile;
  } else {
    // Assume relative paths are relative to the file that is calling `importPluginsJSONFile`
    const caller = stack()[1];
    const callerFileName = caller.getFileName();
    absolutePluginsFile = path.join(path.dirname(callerFileName), pluginsFile);
  }

  let { default: pluginRefs } = await import(absolutePluginsFile);

  if (typeof transformPlugins === "function") {
    // allow plugins to be added and removed
    pluginRefs = transformPlugins(pluginRefs);
  }

  // Now import each module that is referenced. They are either package names or
  // paths that are relative to the JSON file.
  /* eslint-disable no-await-in-loop */
  const plugins = {};
  for (const [name, pluginPath] of Object.entries(pluginRefs)) {
    let plugin;

    // Distinguish between pre-imported modules, node module paths, and relative/absolute paths
    if (typeof pluginPath !== "string") {
      Logger.debug({ pluginPath, pluginRefs });
      throw new Error(`Plugin "${name}" is not set to a string`);
    } else if (/[a-zA-Z@]/.test(pluginPath[0])) {
      ({ default: plugin } = await import(pluginPath));
    } else {
      ({ default: plugin } = await import(path.join(path.dirname(absolutePluginsFile), pluginPath)));
    }

    plugins[name] = plugin;
  }
  /* eslint-enable no-await-in-loop */

  return plugins;
}
