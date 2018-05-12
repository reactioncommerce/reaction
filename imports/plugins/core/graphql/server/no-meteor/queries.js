import accounts from "/imports/plugins/core/accounts/server/no-meteor/queries";
import catalog from "/imports/plugins/core/catalog/server/no-meteor/queries";

export default {
  accounts,
  catalog,
  shops: {
    shopById: (context, _id) => context.collections.Shops.findOne({ _id })
  }
};
