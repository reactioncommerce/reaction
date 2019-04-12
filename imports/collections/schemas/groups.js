import SimpleSchema from "simpl-schema";
import { registerSchema } from "@reactioncommerce/schemas";
import { createdAtAutoValue, updatedAtAutoValue } from "./helpers";

/**
 * @name Group
 * @memberof Schemas
 * @type {SimpleSchema}
 * @property {String} name required
 * @property {String} description optional
 * @property {String} slug required
 * @property {String[]} permissions optional
 * @property {String} shopId required
 * @property {String} createdBy optional
 * @property {Date} createdAt required
 * @property {Date} updatedAt required
 */
export const Groups = new SimpleSchema({
  "name": {
    type: String
  },
  "description": {
    type: String,
    optional: true
  },
  "slug": {
    type: String
  },
  "permissions": {
    type: Array,
    optional: true
  },
  "permissions.$": {
    type: String
  },
  "shopId": {
    type: String
  },
  "createdBy": {
    type: String,
    optional: true,
    regEx: SimpleSchema.RegEx.Id,
    autoValue() {
      return this.userId || this.value;
    }
  },
  "createdAt": {
    type: Date,
    autoValue: createdAtAutoValue
  },
  "updatedAt": {
    type: Date,
    autoValue: updatedAtAutoValue
  }
});

registerSchema("Groups", Groups);
