/**
 * Arguments passed by the client for a query
 * @typedef {Object} ConnectionArgs - an object of all arguments that were sent by the client
 * @property {String} args.after - Connection argument
 * @property {String} args.before - Connection argument
 * @property {Number} args.first - Connection argument
 * @property {Number} args.last - Connection argument
 * @property {Number} args.sortBy - Connection argument. Check schema for allowed values.
 * @property {Number} args.sortOrder - Connection argument
 */

import { merge } from "lodash";
import account from "./account";
import core from "./core";
import ping from "./ping";
import scalar from "./scalar";
import shop from "./shop";
import tag from "./tag";

export default merge({}, account, core, scalar, ping, shop, tag);
