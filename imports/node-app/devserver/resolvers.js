// CORE
import { merge } from "lodash";
import taxes from "/imports/plugins/core/taxes/server/no-meteor/resolvers";

export default merge(
  {},
  taxes
);
