// CORE
import address from "/imports/plugins/core/address/server/no-meteor/schemas";
import payments from "/imports/plugins/core/payments/server/no-meteor/schemas";
import shipping from "/imports/plugins/core/shipping/server/no-meteor/schemas";
import taxes from "/imports/plugins/core/taxes/server/no-meteor/schemas";
// INCLUDED
import marketplace from "/imports/plugins/included/marketplace/server/no-meteor/schemas";
import paymentsExample from "/imports/plugins/included/payments-example/server/no-meteor/schemas";
import paymentsStripe from "/imports/plugins/included/payments-stripe/server/no-meteor/schemas";

export default [
  ...address,
  ...payments,
  ...shipping,
  ...taxes,
  ...marketplace,
  ...paymentsExample,
  ...paymentsStripe
];
