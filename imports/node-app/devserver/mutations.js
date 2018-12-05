import { merge } from "lodash";
import accounts from "/imports/plugins/core/accounts/server/no-meteor/mutations";
import cart from "/imports/plugins/core/cart/server/no-meteor/mutations";
import catalog from "/imports/plugins/core/catalog/server/no-meteor/mutations";
import orders from "/imports/plugins/core/orders/server/no-meteor/mutations";
import taxes from "/imports/plugins/core/taxes/server/no-meteor/mutations";

export default merge({}, accounts, cart, catalog, orders, taxes);
