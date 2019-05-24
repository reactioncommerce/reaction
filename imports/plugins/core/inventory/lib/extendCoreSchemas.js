import { CatalogProduct } from "/imports/collections/schemas";

/**
 * @property {Boolean} isBackorder required, Indicates when a product is currently backordered
 * @property {Boolean} isLowQuantity required, Indicates that the product quantity is too low
 * @property {Boolean} isSoldOut required, Indicates when the product quantity is zero
 */
CatalogProduct.extend({
  isBackorder: Boolean,
  isLowQuantity: Boolean,
  isSoldOut: Boolean
});
