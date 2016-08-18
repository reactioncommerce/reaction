import _ from "lodash";
import bunyan from "bunyan";
import { Meteor } from "meteor/meteor";

/*
 * configure bunyan logging module for reaction client
 * See: https://github.com/trentm/node-bunyan#levels
 * client we'll cofigure WARN as default
 */
let isDebug = "WARN";

if (typeof Meteor.settings === "object" &&
  typeof Meteor.settings.public === "object" && Meteor.settings.public.debug) {
  isDebug = Meteor.settings.public.debug;
}

const levels = ["FATAL", "ERROR", "WARN", "INFO", "DEBUG", "TRACE"];

if (typeof isDebug !== "boolean" && typeof isDebug !== "undefined") {
  isDebug = isDebug.toUpperCase();
}

if (!_.includes(levels, isDebug)) {
  isDebug = "INFO";
}

const Logger = bunyan.createLogger({
  name: "core-client"
});

Logger.level(isDebug);

export default Logger;
