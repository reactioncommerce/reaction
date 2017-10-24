import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";

export const methods = {
  /**
   * shipping/dimension/add
   * add new parcel dimension method
   * @summary insert parcel dimension: weight, height, length, and width
   * @param { Object } dimension a valid dimension object
   */
  "shipping/dimension/add": function (dimension) {
    check(dimension, {
      _id: Match.Optional(String),
      weight: Match.Optional(Number),
      height: Match.Optional(Number),
      length: Match.Optional(Number),
      width: Match.Optional(Number),
      enabled: Boolean
    });
  },

  /**
   * shipping/dimension/update
   * @summary update parcel dimension
   * @param { Object } dimension a valid dimension object
   */
  "shipping/dimension/update": function (dimension) {
    check(dimension);
  }
};

Meteor.methods(methods);
