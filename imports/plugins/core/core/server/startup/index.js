import Logger from "@reactioncommerce/logger";
import appEvents from "/imports/node-app/core/util/appEvents";
import register from "/imports/node-app/core-services/core/index.js";
import Reaction from "../Reaction";
import startNodeApp from "./startNodeApp";
import "./browser-policy";
import CollectionSecurity from "./collection-security";
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

      Promise.await(appEvents.emit("readyForMigrations"));

      // DEPRECATED. Avoid consuming this hook in new code
      Promise.await(appEvents.emit("afterCoreInit"));

      // Main purpose of this right now is to wait to start Meteor app tests
      Reaction.emitAppStartupComplete();

      return null;
    })
    .catch((error) => {
      Logger.error(error);
    });
}
