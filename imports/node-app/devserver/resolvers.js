// CORE
import { merge } from "lodash";
import accounts from "/imports/plugins/core/accounts/server/no-meteor/resolvers";
import address from "/imports/plugins/core/address/server/no-meteor/resolvers";
import cart from "/imports/plugins/core/cart/server/no-meteor/resolvers";
import catalog from "/imports/plugins/core/catalog/server/no-meteor/resolvers";
import core from "/imports/plugins/core/core/server/no-meteor/resolvers";
import navigation from "/imports/plugins/core/navigation/server/no-meteor/resolvers";
import orders from "/imports/plugins/core/orders/server/no-meteor/resolvers";
import payments from "/imports/plugins/core/payments/server/no-meteor/resolvers";
import product from "/imports/plugins/core/product/server/no-meteor/resolvers";
import shipping from "/imports/plugins/core/shipping/server/no-meteor/resolvers";
import taxes from "/imports/plugins/core/taxes/server/no-meteor/resolvers";
// INCLUDED
import shippingRates from "/imports/plugins/included/shipping-rates/server/no-meteor/resolvers";

export default merge(
  {},
  accounts,
  address,
  cart,
  catalog,
  core,
  navigation,
  orders,
  payments,
  product,
  shipping,
  taxes,
  shippingRates
);
