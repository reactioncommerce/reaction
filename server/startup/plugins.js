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
 * Dynamically create a plugin imports file on client or server
 * @param  {String} file - absolute path to file to write
 * @param  {Array} imports - array of import path strings
 * @return {Boolean} returns true if no error
 */
function generateImportsFile(file, imports) {
  // create/reset imports file
  try {
    Logger.info(`Resetting plugins file at ${file}`);
    fs.writeFileSync(file, "");
  } catch (e) {
    Logger.error(e, `Failed to reset plugins file at ${file}`);
    throw new Meteor.Error(e);
  }

  // populate plugins file with imports
  imports.forEach((importPath) => {
    try {
      fs.appendFileSync(file, `import "${importPath}";\n`);
    } catch (e) {
      Logger.error(e, `Failed to write to plugins file at ${importPath}`);
      throw new Meteor.Error(e);
    }
  });
}


/**
 * Import (require) Reaction plugins
 * @param {String} baseDirPath - path to a plugins sub-directory (core/included/custom)
 * @return {Object} - returns object with client and server keys that contain arrays
 */
function getImportPaths(baseDirPath) {
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

  let clientImportPaths = [];
  let serverImportPaths = [];

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

    // import the client files if they exist and plugin is enabled
    if (!isEmptyOrMissing(clientImport)) {
      Logger.info(`Client import found for ${plugin}`);

      if (pkg && pkg.enabled || !pkg && registry && registry.autoEnable) {
        clientImportPaths.push(getImportPath(clientImport));
      }
    }

    // import the server files if they exist and plugin is enabled
    if (!isEmptyOrMissing(serverImport)) {
      Logger.info(`Server import found for ${plugin}`);

      if (pkg && pkg.enabled || !pkg && registry && registry.autoEnable) {
        Logger.info(`${_.upperFirst(plugin)} plugin is enabled.`);
        serverImportPaths.push(getImportPath(serverImport));
      }
    }
  });

  return {
    client: clientImportPaths,
    server: serverImportPaths
  };
}


/**
 * Define base plugin paths
 */
const pluginsPath = path.resolve(".").split(".meteor")[0] + "imports/plugins/";
const corePlugins = pluginsPath + "core/";
const customPlugins = pluginsPath + "custom/";
const includedPlugins = pluginsPath + "included/";


export default function () {
  // get imports from each plugin directory
  const core = getImportPaths(corePlugins);
  const custom = getImportPaths(customPlugins);
  const included = getImportPaths(includedPlugins);

  // concat all imports
  const clientImports = [].concat(core.client, custom.client, included.client);
  const serverImports = [].concat(core.server, custom.server, included.server);

  const appRoot = path.resolve(".").split(".meteor")[0];

  // create import files on client and server and write import statements
  generateImportsFile(appRoot + "client/plugins.js", clientImports);
  generateImportsFile(appRoot + "server/plugins.js", serverImports);
}
