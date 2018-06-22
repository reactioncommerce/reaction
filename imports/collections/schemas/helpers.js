import Random from "@reactioncommerce/random";
import { Meteor } from "meteor/meteor";

/**
 * @name createdAtAutoValue
 * @memberof Schemas
 * @method
 * @summary Helper method used for schema injection autoValue
 * @example autoValue: createdAtAutoValue
 * @return {Date} Date representing now if it's an insert
 */
export function createdAtAutoValue() {
  // We don't want to unset or overwrite a createdAt in a nested
  // document, for example, in a product being added to cart items
  if (this.closestSubschemaFieldName) return;

  if (this.isInsert) return new Date();
  if (this.isUpsert) return { $setOnInsert: new Date() };
  this.unset();
}

/**
 * @name updatedAtAutoValue
 * @memberof Schemas
 * @method
 * @summary Helper method used for schema injection autoValue
 * @example autoValue: updatedAtAutoValue
 * @return {Date} Date representing now
 */
export function updatedAtAutoValue() {
  // We don't want to overwrite an updatedAt in a nested
  // document, for example, in a product being added to cart items
  if (this.closestSubschemaFieldName) return;

  return new Date();
}

/**
 * @name schemaIdAutoValue
 * @memberof Schemas
 * @method
 * @summary Helper method used for schema injection autoValue
 * @example autoValue: schemaIdAutoValue
 * @return {String} randomId
 */
export function schemaIdAutoValue() {
  if (this.isSet && Meteor.isServer) {
    return this.value;
  } else if ((Meteor.isServer && this.operator !== "$pull") || (Meteor.isClient && this.isInsert)) {
    return Random.id();
  }
  return this.unset();
}
