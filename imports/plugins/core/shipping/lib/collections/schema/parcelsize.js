import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { registerSchema } from "@reactioncommerce/reaction-collections";

SimpleSchema.messages({
  "greaterThanZero length": "Length must be greater than 0",
  "greaterThanZero width": "Width must be greater than 0",
  "greaterThanZero height": "Height must be greater than 0",
  "greaterThanZero weight": "Weight must be greater than 0"
});


/**
 * @name ParcelSize
 * @memberof schemas
 * @type {SimpleSchema}
 * @property {Number} length
 * @property {Number} width
 * @property {Number} height
 * @property {Number} weight
 */
export const ParcelSize = new SimpleSchema({
  length: {
    type: Number,
    decimal: true,
    custom: function () {
      if (this.value <= 0) {
        return "greaterThanZero length";
      }
    }
  },
  width: {
    type: Number,
    decimal: true,
    custom: function () {
      if (this.value <= 0) {
        return "greaterThanZero width";
      }
    }
  },
  height: {
    type: Number,
    decimal: true,
    custom: function () {
      if (this.value <= 0) {
        return "greaterThanZero height";
      }
    }
  },
  weight: {
    type: Number,
    decimal: true,
    custom: function () {
      if (this.value <= 0) {
        return "greaterThanZero weight";
      }
    }
  }
});

registerSchema("ParcelSize", ParcelSize);
