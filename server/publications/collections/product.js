import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Media, Products, Revisions, Shops } from "/lib/collections";
import { Logger, Reaction } from "/server/api";
import { RevisionApi } from "/imports/plugins/core/revisions/lib/api/revisions";


/**
 * Helper function that creates and returns a Cursor of Media for relevant
 * products to a publication
 * @method findProductMedia
 * @param {Object} publicationInstance instance of the publication that invokes this method
 * @param {array} productIds array of productIds
 * @return {Object} Media Cursor containing the product media that matches the selector
 */
export function findProductMedia(publicationInstance, productIds) {
  const selector = {};

  if (Array.isArray(productIds)) {
    selector["metadata.productId"] = {
      $in: productIds
    };
  } else {
    selector["metadata.productId"] = productIds;
  }

  // No one needs to see archived images on products
  selector["metadata.workflow"] = {
    $nin: ["archived"]
  };

  // Product editors can see both published and unpublished images
  // There is an implied shopId in Reaction.hasPermission that defaults to
  // the active shopId via Reaction.getShopId
  if (!Reaction.hasPermission(["createProduct"], publicationInstance.userId)) {
    selector["metadata.workflow"].$in = [null, "published"];
  }


  // TODO: We should differentiate between the media selector for the product grid and PDP
  // The grid shouldn't need more than one Media document per product, while the PDP will need
  // all the images associated with the
  return Media.find(selector, {
    sort: {
      "metadata.priority": 1
    }
  });
}


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

  const preSelector = {
    $or: [{
      _id: productIdOrHandle
    }, {
      handle: {
        $regex: productIdOrHandle,
        $options: "i"
      }
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
      preSelector.shopId = shop._id;
    } else {
      return this.ready();
    }
  }

  // TODO review for REGEX / DOS vulnerabilities.
  const product = Products.findOne(preSelector);

  if (!product) {
    // Product not found, return empty subscription.
    return this.ready();
  }

  const _id = product._id;

  const selector = {
    isVisible: true,
    isDeleted: { $in: [null, false] },
    $or: [
      { _id: _id },
      { ancestors: _id }
    ]
  };

  // Authorized content curators for the shop get special publication of the product
  // all all relevant revisions all is one package
  if (Reaction.hasPermission(["owner", "createProduct"], this.userId, product.shopId)) {
    selector.isVisible = {
      $in: [true, false, undefined]
    };

    if (RevisionApi.isRevisionControlEnabled()) {
      const productCursor = Products.find(selector);
      const productIds = productCursor.map(p => p._id);

      const handle = productCursor.observeChanges({
        added: (id, fields) => {
          const revisions = Revisions.find({
            "documentId": id,
            "workflow.status": {
              $nin: [
                "revision/published"
              ]
            }
          }).fetch();
          fields.__revisions = revisions;

          this.added("Products", id, fields);
        },
        changed: (id, fields) => {
          const revisions = Revisions.find({
            "documentId": id,
            "workflow.status": {
              $nin: [
                "revision/published"
              ]
            }
          }).fetch();

          fields.__revisions = revisions;
          this.changed("Products", id, fields);
        },
        removed: (id) => {
          this.removed("Products", id);
        }
      });

      const handle2 = Revisions.find({
        "workflow.status": {
          $nin: [
            "revision/published"
          ]
        }
      }).observe({
        added: (revision) => {
          let observedProduct;
          if (!revision.parentDocument) {
            observedProduct = Products.findOne(revision.documentId);
          } else {
            observedProduct = Products.findOne(revision.parentDocument);
          }
          if (observedProduct) {
            this.added("Products", observedProduct._id, observedProduct);
            this.added("Revisions", revision._id, revision);
          }
        },
        changed: (revision) => {
          let observedProduct;
          if (!revision.parentDocument) {
            observedProduct = Products.findOne(revision.documentId);
          } else {
            observedProduct = Products.findOne(revision.parentDocument);
          }

          if (observedProduct) {
            observedProduct.__revisions = [revision];
            this.changed("Products", observedProduct._id, observedProduct);
            this.changed("Revisions", revision._id, revision);
          }
        },
        removed: (revision) => {
          let observedProduct;
          if (!revision.parentDocument) {
            observedProduct = Products.findOne(revision.documentId);
          } else {
            observedProduct = Products.findOne(revision.parentDocument);
          }
          if (observedProduct) {
            observedProduct.__revisions = [];
            this.changed("Products", observedProduct._id, observedProduct);
            this.removed("Revisions", revision._id, revision);
          }
        }
      });

      this.onStop(() => {
        handle.stop();
        handle2.stop();
      });

      return [
        findProductMedia(this, productIds)
      ];
    }

    // Revision control is disabled, but is an admin
    const productCursor = Products.find(selector);
    const productIds = productCursor.map(p => p._id);
    const mediaCursor = findProductMedia(this, productIds);

    return [
      productCursor,
      mediaCursor
    ];
  }

  // Everyone else gets the standard, visible products and variants
  const productCursor = Products.find(selector);
  const productIds = productCursor.map(p => p._id);
  const mediaCursor = findProductMedia(this, productIds);

  return [
    productCursor,
    mediaCursor
  ];
});
