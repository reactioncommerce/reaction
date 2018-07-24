import SimpleSchema from "simpl-schema";
import { Meteor } from "meteor/meteor";

// This is needed so that it throws a Meteor.Error as `check()` would do
// when we call schema.validate() in a Meteor method.
// https://github.com/aldeed/node-simple-schema/#customize-the-error-that-is-thrown
SimpleSchema.defineValidationErrorTransform((error) => {
  const ddpError = new Meteor.Error(error.message);
  ddpError.error = "validation-error";
  ddpError.details = error.details;
  return ddpError;
});
