import { Meteor } from "meteor/meteor";
import Logger from "@reactioncommerce/logger";
import appEvents from "/imports/node-app/core/util/appEvents";
import Reaction from "../Reaction";
import register from "../no-meteor/register";
import startNodeApp from "./startNodeApp";
import "./browser-policy";
import CollectionSecurity from "./collection-security";
import { importAllTranslations } from "./i18n";
import LoadFixtureData from "./load-data";
import Prerender from "./prerender";
import RateLimiters from "./rate-limits";

const { REACTION_METEOR_APP_COMMAND_START_TIME } = process.env;

/**
 * @summary Core startup function
 * @returns {undefined}
 */
export default function startup() {
  const startTime = Date.now();

  // This env may be set by the launch script, allowing us to time how long Meteor build/startup took.
  if (REACTION_METEOR_APP_COMMAND_START_TIME) {
    const elapsedMs = startTime - Number(REACTION_METEOR_APP_COMMAND_START_TIME);
    Logger.info(`Meteor startup finished: ${elapsedMs}ms (This is incorrect if this is a restart.)`);
  }

  Reaction.whenAppInstanceReady(register);

  LoadFixtureData();

  // make sure the default shop has been created before going further
  while (!Reaction.getShopId()) {
    Logger.warn("No shopId, waiting one second...");
    Meteor._sleepForMs(1000);
  }

  Reaction.loadPackages();
  Reaction.createGroups();
  Reaction.setAppVersion();

  // DEPRECATED. Avoid consuming this hook in new code
  appEvents.emit("afterCoreInit");

  importAllTranslations();

  Prerender();
  CollectionSecurity();
  RateLimiters();

  startNodeApp({
    async onAppInstanceCreated(app) {
      await Reaction.onAppInstanceCreated(app);
    }
  })
    .then(() => {
      const endTime = Date.now();
      Logger.info(`Reaction initialization finished: ${endTime - startTime}ms`);

      // Main purpose of this right now is to wait to start Meteor app tests
      Reaction.emitAppStartupComplete();

      return null;
    })
    .catch((error) => {
      Logger.error(error);
    });
}
