import { includes } from "lodash";
import bunyan from "bunyan";
import { Meteor } from "meteor/meteor";

/*
 * configure bunyan logging module for reaction client
 * See: https://github.com/trentm/node-bunyan#levels
 * client we'll cofigure WARN as default
 */
const levels = ["FATAL", "ERROR", "WARN", "INFO", "DEBUG", "TRACE"];

// set stdout log level
let level = Meteor.settings.public.REACTION_LOG_LEVEL || "WARN";

level = level.toUpperCase();

if (!includes(levels, level)) {
  level = "WARN";
}

const Logger = bunyan.createLogger({
  name: "reaction-client",
  level
});

export default Logger;
