import { merge } from "lodash";
// CORE
import accounts from "/imports/plugins/core/accounts/server/no-meteor/mutations";
import cart from "/imports/plugins/core/cart/server/no-meteor/mutations";
import catalog from "/imports/plugins/core/catalog/server/no-meteor/mutations";
import navigation from "/imports/plugins/core/navigation/server/no-meteor/mutations";
import orders from "/imports/plugins/core/orders/server/no-meteor/mutations";
import payments from "/imports/plugins/core/payments/server/no-meteor/mutations";
import shipping from "/imports/plugins/core/shipping/server/no-meteor/mutations";
import taxes from "/imports/plugins/core/taxes/server/no-meteor/mutations";
// INCLUDED
import shippingRates from "/imports/plugins/included/shipping-rates/server/no-meteor/mutations";

export default merge(
  {},
  accounts,
  cart,
  catalog,
  navigation,
  orders,
  payments,
  shipping,
  taxes,
  shippingRates
);
