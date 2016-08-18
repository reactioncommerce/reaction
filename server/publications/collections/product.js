import { Products } from "/lib/collections";
import { Logger, Reaction } from "/server/api";

/**
 * product detail publication
 * @param {String} productId - productId or handle
 * @return {Object} return product cursor
 */
Meteor.publish("Product", function (productId) {
  check(productId, Match.OptionalOrNull(String));
  if (!productId) {
    Logger.info("ignoring null request on Product subscription");
    return this.ready();
  }
  let _id;
  let shop = Reaction.getCurrentShop();
  // verify that shop is ready
  if (typeof shop !== "object") {
    return this.ready();
  }

  let selector = {};
  selector.isVisible = true;

  if (Roles.userIsInRole(this.userId, ["owner", "admin", "createProduct"],
      shop._id)) {
    selector.isVisible = {
      $in: [true, false]
    };
  }
  // TODO review for REGEX / DOS vulnerabilities.
  if (productId.match(/^[A-Za-z0-9]{17}$/)) {
    selector._id = productId;
    // TODO try/catch here because we can have product handle passed by such regex
    _id = productId;
  } else {
    selector.handle = {
      $regex: productId,
      $options: "i"
    };
    const products = Products.find(selector).fetch();
    if (products.length > 0) {
      _id = products[0]._id;
    } else {
      return this.ready();
    }
  }
  selector = { $or: [{ _id: _id }, { ancestors: { $in: [_id] }}] };

  return Products.find(selector);
});
