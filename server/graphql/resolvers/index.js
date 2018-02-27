import { merge } from "lodash";
import { resolvers as hello } from "./hello";
import { resolvers as ping } from "./ping";
import { resolvers as scalars } from "./scalars";
import { resolvers as users } from "./users";

export const resolvers = merge(hello, ping, scalars, users);
