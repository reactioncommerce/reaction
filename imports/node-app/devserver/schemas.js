// INCLUDED
import marketplace from "/imports/plugins/included/marketplace/server/no-meteor/schemas";
import paymentsExample from "/imports/plugins/included/payments-example/server/no-meteor/schemas";
import paymentsStripe from "/imports/plugins/included/payments-stripe/server/no-meteor/schemas";

export default [
  ...marketplace,
  ...paymentsExample,
  ...paymentsStripe
];
