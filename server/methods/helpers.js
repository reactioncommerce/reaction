import { Meteor } from "meteor/meteor";

/**
 * @file Meteor methods for Reaction
 *
 *
 * @namespace Meteor/Reaction
*/
Meteor.methods({
  /**
   * @name getUserId
   * @method
   * @memberof Meteor/Reaction
   * @summary return server side userId if available
   * @return {String} userId - if available
   */
  "reaction/getUserId": function () {
    return Meteor.userId();
  }
});
