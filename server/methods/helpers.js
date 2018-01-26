import { Meteor } from "meteor/meteor";

/**
 * @file Meteor methods for Reaction
 *
 *
 * @namespace Methods/Reaction
*/
Meteor.methods({
  /**
   * @name reaction/getUserId
   * @method
   * @memberof Methods/Reaction
   * @summary return server side userId if available
   * @return {String} userId - if available
   */
  "reaction/getUserId"() {
    return Meteor.userId();
  }
});
