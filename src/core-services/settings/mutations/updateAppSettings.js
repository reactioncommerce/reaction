import ReactionError from "@reactioncommerce/reaction-error";
import {
  addGlobalSettingDefaults,
  addShopSettingDefaults,
  rolesThatCanEditGlobalSetting,
  rolesThatCanEditShopSetting,
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
  const { collections, userHasPermission } = context;
  const { AppSettings } = collections;

  const updateKeys = Object.keys(settingsUpdates);
  if (updateKeys.length === 0) {
    throw new ReactionError("invalid-param", "You must request at least one update");
  }

  // Look up roles that are allowed to set each setting. Throw if not allowed.
  updateKeys.forEach((field) => {
    const allowedRoles = shopId ? rolesThatCanEditShopSetting(field) : rolesThatCanEditGlobalSetting(field);
    if (allowedRoles.length === 0 || !userHasPermission(allowedRoles, shopId)) {
      throw new ReactionError("access-denied", `You are not allowed to edit the "${field}" setting`);
    }
  });

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
