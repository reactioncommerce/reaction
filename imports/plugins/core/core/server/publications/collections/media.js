import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { MediaRecords } from "/lib/collections";
import Reaction from "/imports/plugins/core/core/server/Reaction";

/**
 * BrandAssets publication
 *
 * Publishes all media where metadata.type is "brandAsset".
 * No security checks.
 */
Meteor.publish("BrandAssets", () => MediaRecords.find({ "metadata.type": "brandAsset" }));

/**
 * ProductGridMedia publication
 *
 * Publishes all published media associated with any of the product IDs passed in.
 *
 * For those with createProduct permission, non-published associated media is also published.
 */
Meteor.publish("ProductGridMedia", function productGridMediaPublish(productIds) {
  check(productIds, [String]);

  if (productIds.length === 0) return [];

  const selector = {
    "metadata.productId": { $in: productIds },
    // No one needs to see archived images on products
    "metadata.workflow": {
      $nin: ["archived"]
    }
  };

  // Product editors can see both published and unpublished images
  // There is an implied shopId in Reaction.hasPermission that defaults to
  // the active shopId via Reaction.getShopId
  if (!Reaction.hasPermission(["createProduct", "product/admin", "product/publish"], this.userId)) {
    selector["metadata.workflow"].$in = [null, "published"];
  }

  return MediaRecords.find(selector);
});

/**
 * ProductMedia publication
 *
 * Publishes all published media associated with the single product ID passed in.
 *
 * For those with createProduct permission, non-published associated media is also published.
 */
Meteor.publish("ProductMedia", function productMediaPublish(id) {
  check(id, String);

  const selector = {
    "metadata.productId": id,
    // No one needs to see archived images on products
    "metadata.workflow": {
      $nin: ["archived"]
    }
  };

  // Product editors can see both published and unpublished images
  // There is an implied shopId in Reaction.hasPermission that defaults to
  // the active shopId via Reaction.getShopId
  if (!Reaction.hasPermission(["createProduct", "product/admin", "product/publish"], this.userId)) {
    selector["metadata.workflow"].$in = [null, "published"];
  }

  return MediaRecords.find(selector);
});
