import { Meteor } from "meteor/meteor";
import Logger from "@reactioncommerce/logger";
import methods from "./methods";
import "./publications";
import startup from "./startup";

// handle any unhandled Promise rejections because
// Node 8 no longer swallows them
process.on("unhandledRejection", (err) => {
  Logger.error(err);
});

Meteor.methods(methods);
Meteor.startup(startup);
