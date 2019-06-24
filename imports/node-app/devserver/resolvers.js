// CORE
import { merge } from "lodash";
import payments from "/imports/plugins/core/payments/server/no-meteor/resolvers";
import shipping from "/imports/plugins/core/shipping/server/no-meteor/resolvers";
import taxes from "/imports/plugins/core/taxes/server/no-meteor/resolvers";

export default merge(
  {},
  payments,
  shipping,
  taxes
);
