import _ from "lodash";
import bunyan from "bunyan";
import bunyanFormat from "bunyan-format";
import { EmailStream } from "bunyan-emailstream";
import { Meteor } from "meteor/meteor";
import { Reaction } from "/server/api";
import Hooks from "../hooks";
import Bunyan2Loggly from "./loggly";


// configure bunyan logging module for reaction server
// See: https://github.com/trentm/node-bunyan#levels
const levels = ["FATAL", "ERROR", "WARN", "INFO", "DEBUG", "TRACE"];

// set stdout log level
let level = process.env.REACTION_LOG_LEVEL || Meteor.settings.REACTION_LOG_LEVEL || "INFO";

// allow overriding the stdout log formatting
// available options: short|long|simple|json|bunyan
// https://www.npmjs.com/package/bunyan-format
const outputMode = process.env.REACTION_LOG_FORMAT || "short";

level = level.toUpperCase();

if (!_.includes(levels, level)) {
  level = "INFO";
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
    }, process.env.LOGGLY_BUFFER_LENGTH || 1)
  };
  streams.push(logglyStream);
}

// Create mutable logger instance and export it. This is intentional.
//
// In order to be able to re-assign with a email stream handler
// after the core has loaded successfully, we need to ensure this is not
// a default export, because default exports are treated similar to exporting
// const values, which can't be re-assigned
// http://2ality.com/2014/09/es6-modules-final.html
//   export default 123;
// equals
//   const D = 123;
//   export { D as default };
//
// eslint-disable-next-line import/no-mutable-exports
export let Logger = bunyan.createLogger({
  name: "Reaction",
  streams
});

// This won't work, even if the Logger instance is declared with let. Any reference to it will
// hold the initial value, not the latest one.
// export default Logger;

Hooks.Events.add("afterCoreInit", () => {
  const reactionEmail = Reaction.getShopEmail();
  if (reactionEmail) {
    try {
      const { user, password, host, port } = Reaction.getShopSettings().mail;
      // Don't start via plaintext when using 465.
      // (Beware: false doesn't mean it's un-encrypted, either)
      const secureConnection = port === 465;
      const reactionAlertsNotificationEmail = process.env.REACTION_ALERTS_NOTFICATION_EMAIL
        || Meteor.settings.reaction.REACTION_ALERTS_NOTFICATION_EMAIL
        || reactionEmail;
      // Nodemailer transportOptions
      const transportOptions = {
        type: "SMTP",
        host,
        port,
        secureConnection
      };

      // Some server, e.g. Maildev don't like credentials
      if (user && password) {
        transportOptions.auth = {
          user,
          pass: password
        };
      }

      const emailStream = new EmailStream(
        // Nodemailer mailOptions
        {
          from: reactionEmail,
          to: reactionAlertsNotificationEmail
        },
        transportOptions
      );

      streams.push({
        type: "raw", // You should use EmailStream with "raw" type!
        stream: emailStream,
        level: "fatal"
      });

      // Replace previously created console logger with this mailer-aware version
      Logger = bunyan.createLogger({
        name: "Reaction",
        streams
      });
    } catch (error) {
      // Not much we can do, but also not a situation we want to exit.
      // Assuming that the standard logger is in place, we may log an error.
      Logger.error("Can't setup email messages for fatal errors: ", error.message);
    }
  }
});
