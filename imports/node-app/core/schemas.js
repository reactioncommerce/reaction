import accounts from "/imports/plugins/core/accounts/server/no-meteor/schemas";
import cart from "/imports/plugins/core/cart/server/no-meteor/schemas";
import catalog from "/imports/plugins/core/catalog/server/no-meteor/schemas";
import core from "/imports/plugins/core/graphql/server/no-meteor/schemas";
import orders from "/imports/plugins/core/orders/server/no-meteor/schemas";
import payments from "/imports/plugins/core/payments/server/no-meteor/schemas";
import shipping from "/imports/plugins/core/shipping/server/no-meteor/schemas";
import shippingRates from "/imports/plugins/core/shipping-rates/server/no-meteor/schemas";

export default [
  ...accounts,
  ...cart,
  ...catalog,
  ...core,
  ...orders,
  ...payments,
  ...shipping,
  ...shippingRates
];
