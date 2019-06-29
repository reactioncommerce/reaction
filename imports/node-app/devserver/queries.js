import { merge } from "lodash";
// CORE
import accounts from "/imports/plugins/core/accounts/server/no-meteor/queries";
import address from "/imports/plugins/core/address/server/no-meteor/queries";
import cart from "/imports/plugins/core/cart/server/no-meteor/queries";
import catalog from "/imports/plugins/core/catalog/server/no-meteor/queries";
import inventory from "/imports/plugins/core/inventory/server/no-meteor/queries";
import navigation from "/imports/plugins/core/navigation/server/no-meteor/queries";
import shipping from "/imports/plugins/core/shipping/server/no-meteor/queries";
import orders from "/imports/plugins/core/orders/server/no-meteor/queries";
import taxes from "/imports/plugins/core/taxes/server/no-meteor/queries";
import tags from "/imports/plugins/core/tags/server/no-meteor/queries";
// INCLUDED
import shippingRates from "/imports/plugins/included/shipping-rates/server/no-meteor/queries";
import simpleInventory from "/imports/plugins/included/simple-inventory/server/no-meteor/queries";
import simplePricing from "/imports/plugins/included/simple-pricing/server/no-meteor/queries";

export default merge(
  {},
  accounts,
  address,
  cart,
  catalog,
  inventory,
  navigation,
  shipping,
  orders,
  taxes,
  tags,
  shippingRates,
  simpleInventory,
  simplePricing
);
