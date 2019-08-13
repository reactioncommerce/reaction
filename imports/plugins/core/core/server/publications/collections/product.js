import Logger from "@reactioncommerce/logger";
import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Catalog, Products, Shops } from "/lib/collections";
import Reaction from "/imports/plugins/core/core/server/Reaction";

/**
 * Flatten variant tree from a Catalog Item Product document
 * @param {Object} product A Catalog Item Product document
 * @returns {Array} Variant array
 */
function flattenCatalogProductVariants(product) {
  const variants = [];

  // Un-tree the variant tree
  if (Array.isArray(product.variants)) {
    // Loop over top-level variants
    product.variants.forEach((variant) => {
      if (Array.isArray(variant.options)) {
        // Loop over variant options
        variant.options.forEach((option) => {
          variants.push({
            ancestors: [
              product.productId,
              variant.variantId
            ],
            type: "variant",
            isVisible: true,
            ...option
          });
        });
      }

      variants.push({
        ancestors: [
          product.productId
        ],
        type: "variant",
        isVisible: true,
        ...variant
      });
    });
  }

  return variants;
}

/**
 * product detail publication
 * @param {String} productIdOrHandle - productId or handle
 * @returns {Object} return product cursor
 */
Meteor.publish("Product", function (productIdOrHandle, shopIdOrSlug) {
  check(productIdOrHandle, Match.OptionalOrNull(String));
  check(shopIdOrSlug, Match.Maybe(String));

  if (!productIdOrHandle) {
    Logger.debug("ignoring null request on Product subscription");
    return this.ready();
  }

  const selector = {
    $or: [{
      _id: productIdOrHandle
    }, {
      handle: productIdOrHandle
    }]
  };

  if (shopIdOrSlug) {
    const shop = Shops.findOne({
      $or: [{
        _id: shopIdOrSlug
      }, {
        slug: shopIdOrSlug
      }]
    });

    if (shop) {
      selector.shopId = shop._id;
    } else {
      return this.ready();
    }
  }

  // TODO review for REGEX / DOS vulnerabilities.
  // Need to peek into product to get associated shop. This is important to check permissions.
  const product = Products.findOne(selector);
  if (!product) {
    // Product not found, return empty subscription.
    return this.ready();
  }

  const { _id } = product;

  selector.isVisible = true;
  selector.isDeleted = { $in: [null, false] };
  selector.$or = [
    { _id },
    { ancestors: _id },
    { handle: productIdOrHandle }];

  // Authorized content curators for the shop get special publication of the product
  // all all relevant revisions all is one package
  if (Reaction.hasPermission(["owner", "createProduct", "product/admin", "product/update"], this.userId, product.shopId)) {
    selector.isVisible = {
      $in: [true, false, undefined]
    };

    return Products.find(selector);
  }

  if (!selector.shopId) {
    selector.shopId = product.shopId;
  }
  // Product data for customers visiting the PDP page
  const cursor = Catalog.find({
    "$or": [{
      "product._id": productIdOrHandle
    }, {
      "product.slug": productIdOrHandle
    }],
    "product.type": "product-simple",
    "product.shopId": selector.shopId,
    "product.isVisible": true,
    "product.isDeleted": { $in: [null, false] }
  });

  const handle = cursor.observeChanges({
    added: (id, { product: catalogProduct }) => {
      this.added("Products", catalogProduct.productId, catalogProduct);
      flattenCatalogProductVariants(catalogProduct).forEach((variant) => {
        this.added("Products", variant.variantId, variant);
      });
    },
    changed: (id, { product: catalogProduct }) => {
      this.changed("Products", catalogProduct.productId, catalogProduct);
      flattenCatalogProductVariants(product).forEach((variant) => {
        this.changed("Products", variant.variantId, variant);
      });
    },
    removed: (id, { product: catalogProduct }) => {
      this.removed("Products", catalogProduct.productId, catalogProduct);
      flattenCatalogProductVariants(product).forEach((variant) => {
        this.removed("Products", variant.variantId, variant);
      });
    }
  });

  this.onStop(() => {
    handle.stop();
  });

  return this.ready();
});
