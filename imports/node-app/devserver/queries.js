import { merge } from "lodash";
// CORE
import address from "/imports/plugins/core/address/server/no-meteor/queries";
import shipping from "/imports/plugins/core/shipping/server/no-meteor/queries";
import taxes from "/imports/plugins/core/taxes/server/no-meteor/queries";

export default merge(
  {},
  address,
  shipping,
  taxes
);
