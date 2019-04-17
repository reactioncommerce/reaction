import Logger from "@reactioncommerce/logger";
import { check } from "meteor/check";
import getGraphQLContextInMeteorMethod from "/imports/plugins/core/graphql/server/getGraphQLContextInMeteorMethod";

/**
 * @name accounts/customizeLoginErrorMessage
 * @memberof Accounts/Methods
 * @method
 * @param {String} username - username/email entered by a user
 * @param {Object} error - error object returned by Meteor.loginWithPassword
 * @returns {Object} custom error object
 */
export default function customizeLoginErrorMessage(username, error) {
  check(username, String);
  check(error, Object);

  let customError = error;
  const context = Promise.await(getGraphQLContextInMeteorMethod());
  const { getFunctionsOfType } = context;
  const customizeErrorFunctions = getFunctionsOfType("customizeLoginErrorMessage");
  if (customizeErrorFunctions.length > 0) {
    customError = customizeErrorFunctions[0](context, username, error);
  } else if (customizeErrorFunctions.length > 1) {
    Logger.warn("More than one customizeLoginErrorMessage function defined. Using first one defined");
  }
  return customError;
}
