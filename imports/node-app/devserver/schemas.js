// CORE
import shipping from "/imports/plugins/core/shipping/server/no-meteor/schemas";
import taxes from "/imports/plugins/core/taxes/server/no-meteor/schemas";
// INCLUDED
import marketplace from "/imports/plugins/included/marketplace/server/no-meteor/schemas";
import paymentsExample from "/imports/plugins/included/payments-example/server/no-meteor/schemas";
import paymentsStripe from "/imports/plugins/included/payments-stripe/server/no-meteor/schemas";

export default [
  ...shipping,
  ...taxes,
  ...marketplace,
  ...paymentsExample,
  ...paymentsStripe
];
