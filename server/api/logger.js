import bunyan from "bunyan";
import bunyanFormat from "bunyan-format";
import Bunyan2Loggly from "bunyan-loggly";
import { includes } from "lodash";

// configure bunyan logging module for reaction server
// See: https://github.com/trentm/node-bunyan#levels
const levels = ["FATAL", "ERROR", "WARN", "INFO", "DEBUG", "TRACE"];

// set stdout log level
let level = process.env.REACTION_LOG_LEVEL || Meteor.settings.REACTION_LOG_LEVEL || "INFO";
let outputMode = "short";

level = level.toUpperCase();

if (!includes(levels, level)) {
  level = "INFO";
}

if (level === "TRACE") {
  outputMode = "json";
}

// default console config (stdout)
const streams = [{
  level,
  stream: bunyanFormat({ outputMode })
}];

// Loggly config (only used if configured)
const logglyToken = process.env.LOGGLY_TOKEN;
const logglySubdomain = process.env.LOGGLY_SUBDOMAIN;

if (logglyToken && logglySubdomain) {
  const logglyStream = {
    type: "raw",
    level: process.env.LOGGLY_LOG_LEVEL || "DEBUG",
    stream: new Bunyan2Loggly({
      token: logglyToken,
      subdomain: logglySubdomain
    })
  };
  streams.push(logglyStream);
}

// create default logger instance
const Logger = bunyan.createLogger({
  name: "Reaction",
  streams
});

export default Logger;
