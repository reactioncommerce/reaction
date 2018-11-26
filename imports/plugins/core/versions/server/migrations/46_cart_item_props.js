import { Migrations } from "meteor/percolate:migrations";
import { Cart, Catalog } from "/lib/collections";
import findAndConvertInBatches from "../util/findAndConvertInBatches";
import findVariantInCatalogProduct from "../util/findVariantInCatalogProduct";

/**
 * @summary Migrate up one cart
 * @param {Object} cart The cart to convert
 * @returns {Object} The converted cart
 */
function convertCartUp(cart) {
  const firstCartItem = cart.items[0];
  if (!firstCartItem) return cart; // already converted
  if ({}.hasOwnProperty.call(firstCartItem, "price")) return cart; // already converted

  const { currencyCode } = cart;

  cart.items = cart.items.map((item) => {
    const catalogItem = Catalog.findOne({ "product.productId": item.productId });
    if (!catalogItem) {
      throw new Error(`CatalogProduct with product ID ${item.productId} not found`);
    }

    const catalogProduct = catalogItem.product;
    const { variant } = findVariantInCatalogProduct(catalogProduct, item.variantId);
    if (!variant) {
      throw new Error(`Product with ID ${item.productId} has no variant with ID ${item.variantId}`);
    }

    const variantPriceInfo = variant.pricing[currencyCode];
    if (!variantPriceInfo) {
      throw new Error(`This product variant does not have a price for ${currencyCode}`);
    }

    item.price = {
      amount: variantPriceInfo.price,
      currencyCode
    };
    item.subtotal = {
      amount: variantPriceInfo.price * item.quantity,
      currencyCode
    };
    if (variantPriceInfo.compareAtPrice || variantPriceInfo.compareAtPrice === 0) {
      item.compareAtPrice = {
        amount: variantPriceInfo.compareAtPrice,
        currencyCode
      };
    } else {
      item.compareAtPrice = null;
    }
    return item;
  });

  return cart;
}

/**
 * @summary Migrate down one cart
 * @param {Object} cart The cart to convert
 * @returns {Object} The converted cart
 */
function convertCartDown(cart) {
  cart.items = cart.items.map((item) => {
    delete item.price;
    delete item.compareAtPrice;
    return item;
  });

  return cart;
}

Migrations.add({
  version: 46,

  up() {
    // Carts
    findAndConvertInBatches({
      collection: Cart,
      converter: (cart) => convertCartUp(cart)
    });
  },

  down() {
    // Carts
    findAndConvertInBatches({
      collection: Cart,
      converter: (cart) => convertCartDown(cart)
    });
  }
});
