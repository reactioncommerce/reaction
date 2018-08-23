import accounts from "/imports/plugins/core/accounts/server/no-meteor/queries";
import catalog from "/imports/plugins/core/catalog/server/no-meteor/queries";
import cart from "/imports/plugins/core/cart/server/no-meteor/queries";

export default {
  accounts,
  catalog,
  cart,
  shops: {
    shopById: (context, _id) => context.collections.Shops.findOne({ _id }),
    shopBySlug: (context, slug) => context.collections.Shops.findOne({ slug })
  }
};
