import { merge } from "lodash";
// CORE
import taxes from "/imports/plugins/core/taxes/server/no-meteor/queries";

export default merge(
  {},
  taxes
);
