/* eslint-disable no-await-in-loop */
import _ from "lodash";

/**
 * @summary Performs migration up from previous data version
 * @param {Object} context Migration context
 * @param {Object} context.db MongoDB `Db` instance
 * @param {Function} context.progress A function to report progress, takes percent
 *   number as argument.
 * @return {undefined}
 */
async function up({ db, progress }) {
  const affectedGroups = [
    "owner",
    "shop-manager"
  ];

  const newShopPermissions = [
    "reaction:legacy:groups/create",
    "reaction:legacy:groups/delete",
    "reaction:legacy:groups/manage:accounts",
    "reaction:legacy:groups/read",
    "reaction:legacy:groups/update",
    "reaction:legacy:inventory/update:settings",
    "reaction:legacy:navigationTreeItems/update:settings",
    "reaction:legacy:navigationTrees/read:drafts",
    "reaction:legacy:shipping-rates/update:settings",
    "reaction:legacy:sitemaps/update:settings",
    "reaction:legacy:tags/read:invisible",
    "reaction:legacy:taxes/update:settings"
  ];

  // get all groups that need new permissions
  const groups = await db.collection("Groups").find({ slug: { $in: affectedGroups } }).toArray();

  if (groups && Array.isArray(groups)) {
    // loop over each group
    for (let index = 0; index < groups.length; index += 1) {
      const group = groups[index];
      const newPermissions = [...group.permissions, ...newShopPermissions];
      // remove duplicates from list
      const uniquePermissions = _.uniq(newPermissions);

      // update Groups collection with new permissions
      await db.collection("Groups").updateOne({
        _id: group._id
      }, {
        $set: {
          permissions: uniquePermissions
        }
      });

      progress(Math.floor((((index + 1) / groups.length) / 2) * 100));
    }
  }

  progress(100);
}

export default {
  down: "impossible",
  up
};
