import { merge } from "lodash";
// CORE
import taxes from "/imports/plugins/core/taxes/server/no-meteor/mutations";

export default merge(
  {},
  taxes
);
