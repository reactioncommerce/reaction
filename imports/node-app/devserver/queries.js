import { merge } from "lodash";
import accounts from "/imports/plugins/core/accounts/server/no-meteor/queries";
import address from "/imports/plugins/core/address/server/no-meteor/queries";
import cart from "/imports/plugins/core/cart/server/no-meteor/queries";
import catalog from "/imports/plugins/core/catalog/server/no-meteor/queries";
import core from "/imports/plugins/core/core/server/no-meteor/queries";
import orders from "/imports/plugins/core/orders/server/no-meteor/queries";
import taxes from "/imports/plugins/core/taxes/server/no-meteor/queries";

export default merge({}, accounts, address, cart, catalog, core, orders, taxes);
