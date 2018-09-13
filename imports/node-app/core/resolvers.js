import { merge } from "lodash";
import accounts from "/imports/plugins/accounts/graphql/server/no-meteor/resolvers";
import cart from "/imports/plugins/cart/graphql/server/no-meteor/resolvers";
import catalog from "/imports/plugins/catalog/graphql/server/no-meteor/resolvers";
import orders from "/imports/plugins/orders/graphql/server/no-meteor/resolvers";
import payments from "/imports/plugins/payments/graphql/server/no-meteor/resolvers";
import product from "/imports/plugins/product/graphql/server/no-meteor/resolvers";
import shipping from "/imports/plugins/shipping/graphql/server/no-meteor/resolvers";
import marketplace from "/imports/plugins/marketplace/graphql/server/no-meteor/resolvers";
import paymentsExample from "/imports/plugins/payments-example/graphql/server/no-meteor/resolvers";
import paymentsStripe from "/imports/plugins/payments-stripe/graphql/server/no-meteor/resolvers";
import shippingRates from "/imports/plugins/shipping-rates/graphql/server/no-meteor/resolvers";

export default merge(
  {},
  accounts,
  cart,
  catalog,
  orders,
  payments,
  product,
  shipping,
  marketplace,
  paymentsExample,
  paymentsStripe,
  shippingRates
);
