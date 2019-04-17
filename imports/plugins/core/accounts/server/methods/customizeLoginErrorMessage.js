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

  const context = Promise.await(getGraphQLContextInMeteorMethod());
  const { getFunctionsOfType } = context;
  const customizeErrorFunctions = getFunctionsOfType("customizeLoginErrorMessage");
  for (const func of customizeErrorFunctions) {
    const customError = Promise.await(func(context, username, error)); // eslint-disable-line no-await-in-loop
    if (customError) {
      return customError;
    }
  }
  return error;
}
