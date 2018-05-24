import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Products, Shops } from "/lib/collections";
import { Logger, Reaction } from "/server/api";

/**
 * product detail publication
 * @param {String} productIdOrHandle - productId or handle
 * @return {Object} return product cursor
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
  if (Reaction.hasPermission(["owner", "createProduct"], this.userId, product.shopId)) {
    selector.isVisible = {
      $in: [true, false, undefined]
    };
  }

  return Products.find(selector);
});
