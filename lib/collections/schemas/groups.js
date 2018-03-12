import SimpleSchema from "simpl-schema";
import { check } from "meteor/check";
import { Tracker } from "meteor/tracker";
import { registerSchema } from "@reactioncommerce/reaction-collections";
import { createdAtAutoValue, updatedAtAutoValue } from "./helpers";

/**
 * @name Group
 * @memberof schemas
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
    type: String,
    regEx: SimpleSchema.RegEx.Id
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
}, { check, tracker: Tracker });

registerSchema("Groups", Groups);
