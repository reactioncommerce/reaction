import bunyan from "bunyan";
import bunyanFormat from "bunyan-format";
import _ from "lodash";

// configure bunyan logging module for reaction server
// See: https://github.com/trentm/node-bunyan#levels
const levels = ["FATAL", "ERROR", "WARN", "INFO", "DEBUG", "TRACE"];
const mode = process.env.NODE_ENV || "production";
let isDebug = Meteor.settings.isDebug || process.env.REACTION_DEBUG || "INFO";

if (isDebug === true || mode === "development" && isDebug !== false) {
  if (typeof isDebug !== "boolean" && typeof isDebug !== undefined) {
    isDebug = isDebug.toUpperCase();
  }
  if (!_.includes(levels, isDebug)) {
    isDebug = "WARN";
  }
}

let formatOut;

if (process.env.VELOCITY_CI === "1") {
  formatOut = process.stdout;
} else {
  formatOut = bunyanFormat({
    outputMode: "short",
    levelInString: false
  });
}

const Logger = bunyan.createLogger({
  name: "Reaction",
  stream: isDebug !== "DEBUG" ? formatOut : process.stdout,
  level: "debug"
});

// set logging level
Logger.level(isDebug);

export default Logger;
