// INCLUDED
import paymentsExample from "/imports/plugins/included/payments-example/server/no-meteor/schemas";
import paymentsStripe from "/imports/plugins/included/payments-stripe/server/no-meteor/schemas";

export default [
  ...paymentsExample,
  ...paymentsStripe
];
