import { Meteor } from "meteor/meteor";

Meteor.methods({
  /**
   * reaction/getUserId
   * @summary return server side userId if available
   * @return {String} userId - if available
   */
  "reaction/getUserId": function () {
    return Meteor.userId();
  }
});
