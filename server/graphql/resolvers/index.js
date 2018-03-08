import { merge } from "lodash";
import { resolvers as account } from "./account";
import { resolvers as datetime } from "./datetime";
import { resolvers as group } from "./group";
import { resolvers as ping } from "./ping";
import { resolvers as role } from "./role";

export const resolvers = merge(account, datetime, group, ping, role);
