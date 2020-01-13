import createDefaultNavigationTreeForShop from "../util/createDefaultNavigationTreeForShop.js";

/**
 * @summary Called on startup
 * @param {Object} context Startup context
 * @returns {undefined}
 */
export default async function shopCreateListenerForNavigation(context) {
  context.appEvents.on("afterShopCreate", async ({ shop }) => {
    if (shop.defaultNavigationTreeId) return;
    await createDefaultNavigationTreeForShop(context, shop);
  });
}
