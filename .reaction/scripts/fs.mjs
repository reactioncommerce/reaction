import fs from 'fs';
import path from 'path';
import Log from './logger.mjs';

/**
 * Synchronously check if a file or directory exists
 * @param {String} searchPath - path to file or directory
 * @returns {Boolean} - returns true if file or directory exists
 */
export function exists(searchPath) {
  try {
    fs.statSync(searchPath);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Synchronously check if a file or directory is empty or doesn't exist
 * @param {String} searchPath - path to file or directory
 * @returns {Boolean} returns true if file or directory is empty or missing
 */
export function isEmptyOrMissing(searchPath) {
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
 * Get an array of directory names in a given path
 * @param {String} dir - path to a directory
 * @returns {Array} returns an array of directory names
 */
export function getDirectories(dir) {
  try {
    const files = fs.readdirSync(dir).filter((file) => {
      return fs.statSync(path.join(dir, file)).isDirectory();
    });
    return files;
  } catch(e) {
    Log.error('Directory not found: ' + dir);
    Log.error(e);
    process.exit(1);
  }
}
