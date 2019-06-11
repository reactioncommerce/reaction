export const packageRolesAndGroups = [];

/**
 * @summary Will be called for every plugin
 * @param {Object} options The options object that the plugin passed to registerPackage
 * @returns {undefined}
 */
export function registerPluginHandler({ addRolesToGroups }) {
  if (Array.isArray(addRolesToGroups)) {
    // We build the packageRolesAndGroups array here, and then we process it
    // in the startup function.
    packageRolesAndGroups.push(...addRolesToGroups);
  }
}
