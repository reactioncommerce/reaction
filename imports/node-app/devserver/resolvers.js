// CORE
import { merge } from "lodash";
import shipping from "/imports/plugins/core/shipping/server/no-meteor/resolvers";
import taxes from "/imports/plugins/core/taxes/server/no-meteor/resolvers";

export default merge(
  {},
  shipping,
  taxes
);
