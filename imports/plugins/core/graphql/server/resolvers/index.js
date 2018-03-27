import { merge } from "lodash";
import account from "./account";
import ping from "./ping";
import scalar from "./scalar";
import shop from "./shop";

export default merge({}, account, scalar, ping, shop);
