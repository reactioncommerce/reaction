import SimpleSchema from "simpl-schema";
import ReactionError from "/imports/plugins/core/graphql/server/no-meteor/ReactionError";

// This is needed so that it throws a ReactionError as `check()` would do
// when we call schema.validate() in a Meteor method.
// https://github.com/aldeed/node-simple-schema/#customize-the-error-that-is-thrown
SimpleSchema.defineValidationErrorTransform((error) => {
  const ddpError = new ReactionError(error.message);
  ddpError.error = "validation-error";
  ddpError.details = error.details;
  return ddpError;
});
