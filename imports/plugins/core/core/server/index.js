import { Meteor } from "meteor/meteor";
import Logger from "@reactioncommerce/logger";
// Methods should be loaded before hooks
import methods from "./methods";
import "./hooks";
import startup from "./startup";

// handle any unhandled Promise rejections because
// Node 8 no longer swallows them
process.on("unhandledRejection", (err) => {
  Logger.error(err);
});

Meteor.methods(methods);
Meteor.startup(startup);
