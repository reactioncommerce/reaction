import { instrument } from "epimetheus";
import { Packages } from "/lib/collections";
import Logger from "@reactioncommerce/logger";
import info from "../../info";

/**
 * @summary Called on startup
 * @param {Object} context Startup context
 * @returns {undefined}
 */
export default function startup(context) {
  let pack;
  try {
    pack = Packages.findOne({ "name": info.packageName, "settings.public.enabled": true });
  } catch (error) {
    Logger.error(error, "Error querying for reaction-metrics-prometheus package at startup");
    return;
  }

  if (!pack) {
    Logger.debug("reaction-metrics-prometheus package is disabled");
    return;
  }
  let { path } = pack.settings.public;
  if (!path.startsWith("/")) {
    path = `/${path}`;
  }
  Logger.debug({ path }, "reaction-metrics-prometheus instrumenting the express app");
  instrument(context.app.expressApp, { url: path });
}
