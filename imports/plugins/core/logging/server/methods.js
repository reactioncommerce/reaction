import { Meteor } from "meteor/meteor";
import { Logs } from "/lib/collections";
import { Reaction } from "/server/api";

export function writeToLog(logType, logLevel, logData, source = "client") {
  check(logType, String);
  check(logLevel, String);
  check(logData, Object);

  const logEntry = {
    logType: logType,
    shopId: Reaction.getShopId(),
    data: logData,
    level: logLevel,
    source: source
  };
  Logs.insert(logEntry);
}

function logError(logType, logData) {
  check(logType, String);
  check(logData, Object);
  if (Roles.userIsInRole(this.userId, ["admin", "owner"])) {
    writeToLog(logType, "error", logData);
  }
}

function logWarning(logType, logData) {
  check(logType, String);
  check(logData, Object);
  if (Roles.userIsInRole(this.userId, ["admin", "owner"])) {
    writeToLog(logType, "warn", logData);
  }
}

Meteor.methods({
  "logging/logError": logError,
  "logging/logWarning": logWarning
});
