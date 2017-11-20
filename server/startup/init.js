import { Meteor } from "meteor/meteor";
import SimpleSchema from "simpl-schema";
import { Reaction, Logger } from "/server/api";
import LoadData from "./load-data";

// This is needed so that it throws a Meteor.Error as `check()` would do
// when we call schema.validate() in a Meteor method.
// https://github.com/aldeed/node-simple-schema/#customize-the-error-that-is-thrown
SimpleSchema.defineValidationErrorTransform(error => {
  const ddpError = new Meteor.Error(error.message);
  ddpError.error = "validation-error";
  ddpError.details = error.details;
  return ddpError;
});

/*
 * Execute start up fixtures
 */

export default function () {
  // load fixture data
  LoadData();
  // initialize Reaction
  Reaction.init();
  // we've finished all reaction core initialization
  Logger.info("Reaction initialization finished.");
}
