import createDefaultNavigationTreeForShop from "../util/createDefaultNavigationTreeForShop";

/**
 * @summary Called on startup
 * @param {Object} context Startup context
 * @returns {undefined}
 */
export default async function shopCreateListener(context) {
  context.appEvents.on("afterShopCreate", async ({ shop }) =>
    createDefaultNavigationTreeForShop(context, shop));
}
