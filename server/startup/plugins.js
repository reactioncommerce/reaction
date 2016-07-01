import fs from "fs";
import path from "path";
import _ from "lodash";
import { Packages } from "/lib/collections";
import { Reaction, Logger } from "/server/api";


/**
 * Synchronously check if a file or directory is empty or doesn't exist
 * @param {String} searchPath - path to file or directory
 * @return {Boolean} - returns true if file or directory isn't empty
 */
function isEmptyOrMissing(searchPath) {
  let stat;
  try {
    stat = fs.statSync(searchPath);
  } catch (e) {
    return true;
  }
  if (stat.isDirectory()) {
    const items = fs.readdirSync(searchPath);
    return !items || !items.length;
  }
  const file = fs.readFileSync(searchPath);
  return !file || !file.length;
}


/**
 * Import (require) Reaction plugins
 * @param {String} baseDirPath - path to a plugins sub-directory (core/included/custom)
 * @return {Boolean} - returns true if there are no errors
 */
export function requirePlugins(baseDirPath) {
  // get an array of directories at a path
  const getDirectories = (dir) => {
    return fs.readdirSync(dir).filter((file) => {
      return fs.statSync(path.join(dir, file)).isDirectory();
    });
  };

  // get app root path
  const appRoot = path.resolve(".").split(".meteor")[0];

  // create the import path for require
  const getImportPath = (pluginFile) => {
    return "/" + path.relative(appRoot, pluginFile);
  };

  // get the packages currently in the database
  const packages = Packages.find().fetch();

  // get all plugin directories at provided base path
  const pluginDirs = getDirectories(baseDirPath);

  // read registry.json and require server/index.js if they exist
  pluginDirs.forEach((plugin) => {
    const registryImport = baseDirPath + plugin + "/register.json";
    const clientImport = baseDirPath + plugin + "/client/index.js";
    const serverImport = baseDirPath + plugin + "/server/index.js";

    let registry;
    let pkg;

    if (!isEmptyOrMissing(registryImport)) {
      Logger.info(`Registry file found for ${plugin}`);

      // register the package
      registry = JSON.parse(fs.readFileSync(registryImport, "utf8"));
      Reaction.registerPackage(registry);

      // get the database document for this plugin (if it exists)
      pkg = _.find(packages, p => p.name === registry.name);
    }

    // import the server files if they exist and plugin is enabled
    if (!isEmptyOrMissing(serverImport)) {
      Logger.info(`Server import found for ${plugin}`);

      if (pkg && pkg.enabled || !pkg && registry && registry.autoEnable) {
        Logger.info(`${_.upperFirst(plugin)} plugin is enabled.`);
        require(getImportPath(serverImport));
      }
    }

    if (registry && registry.name) {
      Logger.info(`Updating the imports for ${plugin}`);

      // update import paths in the database
      Packages.update({ name: registry.name }, {
        $set: {
          imports: [{
            type: "registry",
            path: isEmptyOrMissing(registryImport) ? "" : getImportPath(registryImport)
          }, {
            type: "client",
            path: isEmptyOrMissing(clientImport) ? "" : getImportPath(clientImport)
          }, {
            type: "server",
            path: isEmptyOrMissing(serverImport) ? "" : getImportPath(serverImport)
          }]
        }
      });
    }
    // temporary separator in the logs for easier reading
    Logger.info("");
  });

  return true;
}


/**
 * Define base plugin paths
 */
const pluginsPath = path.resolve(".").split(".meteor")[0] + "imports/plugins/";
const corePlugins = pluginsPath + "core/";
const customPlugins = pluginsPath + "custom/";
const includedPlugins = pluginsPath + "included/";


export default function () {
  requirePlugins(corePlugins);
  requirePlugins(customPlugins);
  requirePlugins(includedPlugins);
}
