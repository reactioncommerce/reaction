import ReactionError from "@reactioncommerce/reaction-error";
import {
  addGlobalSettingDefaults,
  addShopSettingDefaults,
  permissionsThatCanEditGlobalSetting,
  permissionsThatCanEditShopSetting,
  runAfterUpdateHooks
} from "../util/settingsConfig.js";

/**
 * @summary Updates app settings for a shop or global app settings.
 * @param {Object} context App context
 * @param {Object} settingsUpdates Fields to be updated
 * @param {String} [shopId] Shop ID. Pass `null` for global settings.
 * @returns {Promise<Object>} Updated app settings for a shop or global app settings
 */
export default async function updateAppSettings(context, settingsUpdates, shopId = null) {
  const { collections } = context;
  const { AppSettings } = collections;

  const updateKeys = Object.keys(settingsUpdates);
  if (updateKeys.length === 0) {
    throw new ReactionError("invalid-param", "You must request at least one update");
  }

  // Look up roles that are allowed to set each setting. Throw if not allowed.
  for (const updateKey of updateKeys) {
    const permissionsNeededToEdit = shopId ? permissionsThatCanEditShopSetting(updateKey) : permissionsThatCanEditGlobalSetting(updateKey);
    if (permissionsNeededToEdit.length === 0) {
      throw new ReactionError("access-denied", `You are not allowed to edit the "${updateKey}" setting`);
    }

    // eslint-disable-next-line no-await-in-loop
    const permissionChecks = await Promise.all(permissionsNeededToEdit.map(async (permission) => {
      const [resource, action] = permission.split("/");
      if (resource && action) {
        return context.userHasPermission(resource, action, { shopId });
      }
      return false;
    }));

    if (permissionChecks.every((permission) => permission === false)) {
      throw new ReactionError("access-denied", "Access Denied");
    }
  }

  const { value: updatedDoc } = await AppSettings.findOneAndUpdate(
    { shopId },
    {
      $set: settingsUpdates
    },
    {
      returnOriginal: false,
      upsert: true
    }
  );

  // We don't want to await these and delay sending a response back
  runAfterUpdateHooks(context, settingsUpdates, shopId);

  return shopId ? addShopSettingDefaults(updatedDoc || {}) : addGlobalSettingDefaults(updatedDoc || {});
}
