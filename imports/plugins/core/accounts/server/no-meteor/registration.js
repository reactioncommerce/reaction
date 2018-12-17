import addRolesToGroups from "/imports/plugins/core/core/server/Reaction/addRolesToGroups"

/**
 * @summary Will be called for every plugin
 * @param {Object} options The options object that the plugin passed to registerPackage
 * @returns {undefined}
 */
export function registerPluginHandler({ addRolesToGroups }) {
  if (Array.isArray(addRolesToGroups)) {
    addRolesToGroups.forEach(({ groups, roles }) => {
      addRolesToGroups({ allShops: true, groups, roles });
    });
  }
}
