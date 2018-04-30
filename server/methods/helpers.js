import { Meteor } from "meteor/meteor";

/**
 * @file Meteor methods for Reaction
 *
 *
 * @namespace Reaction/Methods
*/
Meteor.methods({
  /**
   * @name reaction/getUserId
   * @method
   * @memberof Reaction/Methods
   * @summary return server side userId if available
   * @return {String} userId - if available
   */
  "reaction/getUserId"() {
    return Meteor.userId();
  }
});
