import ensureRoles from "./util/ensureRoles.js";
import {
  defaultAccountsManagerRoles,
  defaultShopManagerRoles,
  defaultShopOwnerRoles,
  defaultSystemManagerRoles
} from "./util/defaultRoles.js";

const shopGroups = {
  "shop manager": defaultShopManagerRoles,
  "owner": defaultShopOwnerRoles
};

/**
 * @summary Called on startup
 * @param {Object} context Startup context
 * @param {Object} context.collections Map of MongoDB collections
 * @returns {undefined}
 */
export default async function simpleAuthStartup(context) {
  const {
    appEvents,
    collections: {
      Groups
    }
  } = context;

  // Add missing roles to `roles` collection if needed
  await ensureRoles(context, defaultAccountsManagerRoles);
  await ensureRoles(context, defaultShopManagerRoles);
  await ensureRoles(context, defaultShopOwnerRoles);
  await ensureRoles(context, defaultSystemManagerRoles);

  // There are two global roles that the accounts plugin creates by default
  // when the first account is created, if they don't exist. We want to
  // immediately set the permissions array to the default list of permissions
  // for both of these.
  //
  // Also, when a shop group is created, we set the default permissions for it,
  // or an empty array for custom groups.
  appEvents.on("afterAccountGroupCreate", async ({ group }) => {
    // If permissions were supplied when creating, do not overwrite them here
    if (Array.isArray(group.permissions) && group.permissions.length > 0) {
      return;
    }

    let permissions = [];

    if (group.slug === "accounts-manager") {
      permissions = defaultAccountsManagerRoles;
    } else if (group.slug === "system-manager") {
      permissions = defaultSystemManagerRoles;
    } else if (group.shopId && group.slug && shopGroups[group.slug]) {
      // get roles from the default groups of the primary shop; we try to use this first before using default roles
      const primaryShopId = await context.queries.primaryShopId(context.getInternalContext());
      const primaryShopGroup = primaryShopId ? await Groups.findOne({ shopId: primaryShopId, slug: group.slug }) : null;
      permissions = (primaryShopGroup && primaryShopGroup.permissions) || shopGroups[group.slug];
    }

    await context.mutations.updateAccountGroup(context.getInternalContext(), {
      group: { permissions },
      groupId: group._id,
      shopId: group.shopId
    });
  });

  // Whenever permissions array changes on any group, ensure that they all exist in
  // the `roles` collection so that the `roles` GQL query will include them.
  appEvents.on("afterAccountGroupUpdate", async ({ group, updatedFields }) => {
    if (!Array.isArray(updatedFields) || !updatedFields.includes("permissions")) return;
    await ensureRoles(context, group.permissions);
  });
}
