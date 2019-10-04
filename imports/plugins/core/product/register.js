/**
 * This file is necessary for backwards compatibility while we refactor
 * the API to remove Meteor. The no-meteor `register.js` file will
 * eventually become the main entry point of the plugin, but for now
 * our Meteor tooling loads this file, so we include this here as a
 * temporary bridge.
 */
import Reaction from "/imports/plugins/core/core/server/Reaction";
import register from "/imports/node-app/core-services/product/index.js";

Reaction.whenAppInstanceReady(register);
