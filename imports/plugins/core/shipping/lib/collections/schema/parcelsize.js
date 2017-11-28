import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { registerSchema } from "@reactioncommerce/reaction-collections";

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
    min: 1,
    decimal: true
  },
  width: {
    type: Number,
    min: 1,
    decimal: true
  },
  height: {
    type: Number,
    min: 1,
    decimal: true
  },
  weight: {
    type: Number,
    min: 1,
    decimal: true
  }
});

registerSchema("ParcelSize", ParcelSize);
