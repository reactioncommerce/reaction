import { merge } from "lodash";
import account from "./account";
import datetime from "./datetime";
import group from "./group";
import ping from "./ping";
import role from "./role";

export default merge({}, account, datetime, group, ping, role);
