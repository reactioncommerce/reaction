import i18n from "./i18n";
import setDiscountsOnCart from "./util/setDiscountsOnCart";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionNodeApp} app The ReactionNodeApp instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Discounts",
    name: "reaction-discounts",
    icon: "fa fa-gift",
    i18n,
    collections: {
      Discounts: {
        name: "Discounts",
        indexes: [
          // Create indexes. We set specific names for backwards compatibility
          // with indexes created by the aldeed:schema-index Meteor package.
          [{ shopId: 1 }, { name: "c2_shopId" }]
        ]
      }
    },
    cart: {
      transforms: [
        {
          name: "setDiscountsOnCart",
          fn: setDiscountsOnCart,
          priority: 10
        }
      ]
    }
  });
}
