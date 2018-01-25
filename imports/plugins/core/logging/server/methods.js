import { Meteor } from "meteor/meteor";
import { Roles } from "meteor/alanning:roles";
import { check } from "meteor/check";
import { Logs } from "/lib/collections";
import { Reaction } from "/server/api";

/**
 *
 * @namespace Methods/Logging
 */

/**
 * @name writeToLog
 * @method
 * @memberof Methods/Logging
 * @summary Writes a log entry into log
 * @param  {String} logType Type
 * @param  {String} logLevel Level
 * @param  {Object} logData Data
 * @param  {String} [source="client"]
 * @return {null}
 */
export function writeToLog(logType, logLevel, logData, source = "client") {
  check(logType, String);
  check(logLevel, String);
  check(logData, Object);

  const logEntry = {
    logType,
    shopId: Reaction.getShopId(),
    data: logData,
    level: logLevel,
    source
  };
  Logs.insert(logEntry);
}

/**
 * @name logging/logError
 * @method
 * @memberof Methods/Logging
 * @param  {String} logType Type
 * @param  {Object} logData Data
 * @return {null}
 */
function logError(logType, logData) {
  check(logType, String);
  check(logData, Object);
  if (Roles.userIsInRole(this.userId, ["admin", "owner"])) {
    writeToLog(logType, "error", logData);
  }
}

/**
 * @name logging/logWarning
 * @method
 * @memberof Methods/Logging
 * @param  {String} logType Type
 * @param  {Object} logData Data
 * @return {null}
 */
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
