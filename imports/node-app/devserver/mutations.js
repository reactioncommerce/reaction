import { merge } from "lodash";
// CORE
import shipping from "/imports/plugins/core/shipping/server/no-meteor/mutations";
import taxes from "/imports/plugins/core/taxes/server/no-meteor/mutations";

export default merge(
  {},
  shipping,
  taxes
);
