import fs  from 'fs-extra';
import path from 'path';
import rimraf from 'rimraf';
import Log from './logger.mjs';
import { exists, getDirectories } from './fs.mjs';


/**
 * getAssetPaths: Get pathnames of all asset directories from each plugin.
 * @param { String } baseDirPath - path to a plugins sub-directory (core/included/custom)
 * @returns { Array } - Array of objects that contains plugin name & absolutepath of plugins `/private` directory
 */
function getAssetPaths(baseDirPath) {
  const assetPaths = [];
  // get all plugin directories at provided base path
  const pluginDirs = getDirectories(baseDirPath);
  pluginDirs.forEach((plugin) => {
    const assetDirectory = baseDirPath + plugin;
    if (exists(assetDirectory)) {
      assetPaths.push({ name: plugin, dir: assetDirectory });
    }
  });
  return assetPaths;
}

/**
 * copyAssets: Copy all asset files into application's /private & /public folders
 * @param { String } appRoot - application root path
 * @param { Array } assetDirs - Array of objects that contains plugin name & absolutepath of plugin's root directory
 * @returns { undefined }
 */
function copyAssets(appRoot, assetDirs) {
  for (const { dir, name } of assetDirs) {
    for (const folder of ['private', 'public']) {
      const sourceDir = dir + '/' + folder;
      const targetDir = path.join(appRoot, folder, 'plugins', name);
      if (exists(sourceDir)) {
        try {
          fs.copySync(sourceDir, targetDir);
        } catch (error) {
          Log.error(`Can't copy files from ${sourceDir} to ${targetDir}: ${error.message}`);
        }
      }
    }
  }
}

/**
 * cleanup: Removes all (possibly outdated) assets, before copying them from each plugin into
 * application wide /public and /private folders.
 * @param { String } appRoot - application root path
 * @returns { undefined }
 */
function cleanup(appRoot) {
  for (const folder of ['private', 'public']) {
    const files = `${appRoot}/${folder}/plugins/!(README.md)`;
    try {
      rimraf.sync(files);
    } catch(error) {
      Log.error(`Can't delete files in ${files}: ${error.message}`);
    }
  }
}

export default function provisionAssets() {
  const appRoot = path.resolve('.').split('.meteor')[0];
  cleanup(appRoot);

  const pluginsPath = path.join(appRoot, '/imports/plugins/');
  const corePlugins = pluginsPath + 'core/';
  const includedPlugins = pluginsPath + 'included/';
  const customPlugins = pluginsPath + 'custom/';

  const core = getAssetPaths(corePlugins);
  const included = getAssetPaths(includedPlugins);
  const custom = getAssetPaths(customPlugins);

  const assetDirs = [].concat(core, included, custom);
  copyAssets(appRoot, assetDirs);
}
