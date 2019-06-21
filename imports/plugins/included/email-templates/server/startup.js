import seedEmailTemplatesForShop from "./util/seedEmailTemplatesForShop";

/**
 * @name startup
 * @summary Called on startup
 * @param {Object} context App context
 * @return {undefined}
 */
export default async function startup(context) {
  context.appEvents.on("afterShopCreate", async (payload) => {
    const { shop } = payload;

    await seedEmailTemplatesForShop(context, shop._id);
  });
}
