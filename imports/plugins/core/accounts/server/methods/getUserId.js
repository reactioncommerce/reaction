import { Meteor } from "meteor/meteor";

/**
 * @deprecated Use Reaction.getUserId instead
 * @name reaction/getUserId
 * @method
 * @memberof Reaction/Methods
 * @summary return server side userId if available
 * @returns {String} userId - if available
 */
export default function getUserId() {
  return Meteor.userId();
}
