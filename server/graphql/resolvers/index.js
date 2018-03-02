import { merge } from "lodash";
import { resolvers as address } from "./address";
import { resolvers as hello } from "./hello";
import { resolvers as ping } from "./ping";
import { resolvers as scalars } from "./scalars";
import { resolvers as users } from "./users";

export const resolvers = merge(address, hello, ping, scalars, users);
