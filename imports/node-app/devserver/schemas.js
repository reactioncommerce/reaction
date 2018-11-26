// CORE
import accounts from "/imports/plugins/core/accounts/server/no-meteor/schemas";
import address from "/imports/plugins/core/address/server/no-meteor/schemas";
import cart from "/imports/plugins/core/cart/server/no-meteor/schemas";
import catalog from "/imports/plugins/core/catalog/server/no-meteor/schemas";
import core from "/imports/plugins/core/core/server/no-meteor/schemas";
import orders from "/imports/plugins/core/orders/server/no-meteor/schemas";
import payments from "/imports/plugins/core/payments/server/no-meteor/schemas";
import product from "/imports/plugins/core/product/server/no-meteor/schemas";
import shipping from "/imports/plugins/core/shipping/server/no-meteor/schemas";
import taxes from "/imports/plugins/core/taxes/server/no-meteor/schemas";
// INCLUDED
import marketplace from "/imports/plugins/included/marketplace/server/no-meteor/schemas";
import paymentsExample from "/imports/plugins/included/payments-example/server/no-meteor/schemas";
import paymentsStripe from "/imports/plugins/included/payments-stripe/server/no-meteor/schemas";
import shippingRates from "/imports/plugins/included/shipping-rates/server/no-meteor/schemas";

export default [
  ...accounts,
  ...address,
  ...cart,
  ...catalog,
  ...core,
  ...orders,
  ...payments,
  ...product,
  ...shipping,
  ...taxes,
  ...marketplace,
  ...paymentsExample,
  ...paymentsStripe,
  ...shippingRates
];
