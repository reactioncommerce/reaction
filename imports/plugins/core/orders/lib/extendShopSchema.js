import { Shop } from "/imports/collections/schemas";

/**
 * @name Shop
 * @memberof Schemas
 * @type {SimpleSchema}
 * @property {Object} orderStatusLabels optional
 */
Shop.extend({
  orderStatusLabels: {
    type: Object,
    blackbox: true
  }
});
