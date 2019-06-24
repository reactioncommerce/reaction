import { merge } from "lodash";
// CORE
import payments from "/imports/plugins/core/payments/server/no-meteor/mutations";
import shipping from "/imports/plugins/core/shipping/server/no-meteor/mutations";
import taxes from "/imports/plugins/core/taxes/server/no-meteor/mutations";

export default merge(
  {},
  payments,
  shipping,
  taxes
);
