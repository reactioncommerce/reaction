import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { registerSchema } from "@reactioncommerce/reaction-collections";

SimpleSchema.messages({
  greaterThanZero: "Value must be greater than zero"
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
        return "greaterThanZero";
      }
    }
  },
  width: {
    type: Number,
    decimal: true,
    custom: function () {
      if (this.value <= 0) {
        return "greaterThanZero";
      }
    }
  },
  height: {
    type: Number,
    decimal: true,
    custom: function () {
      if (this.value <= 0) {
        return "greaterThanZero";
      }
    }
  },
  weight: {
    type: Number,
    decimal: true,
    custom: function () {
      if (this.value <= 0) {
        return "greaterThanZero";
      }
    }
  }
});

registerSchema("ParcelSize", ParcelSize);
