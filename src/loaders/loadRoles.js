import RolesData from "../json-data/roles.json";


/**
 * @summary load Roles data
 * @param {Object} context - The application context
 * @returns {Promise<boolean>} true if success
 */
export default async function loadRoles(context) {
  const { collections: { roles } } = context;
  roles.insertMany(RolesData);
  return true;
}
