import { packageRolesAndGroups } from "../registration.js";
import addRolesToGroups from "./addRolesToGroups.js";
import ensureRoles from "./ensureRoles.js";

/**
 * @summary Add roles to groups as specified in the `addRolesToGroups` key
 *   of various plugin `registerPlugin` config. Either for one shop or all.
 * @param {Object} context App context
 * @param {String} shopId Shop ID
 * @returns {undefined}
 */
export default async function addPluginRolesToGroups(context, shopId) {
  const promises = packageRolesAndGroups.map(async ({ groups, roles }) => {
    await ensureRoles(context, roles);
    await addRolesToGroups(context, { allShops: !shopId, groups, roles, shops: [shopId] });
  });

  await Promise.all(promises);
}
