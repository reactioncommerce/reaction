import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Products, Revisions, Shops } from "/lib/collections";
import { Logger, Reaction } from "/server/api";
import { RevisionApi } from "/imports/plugins/core/revisions/lib/api/revisions";

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

    if (RevisionApi.isRevisionControlEnabled()) {
      const handle = Revisions.find({
        "workflow.status": {
          $nin: [
            "revision/published"
          ]
        },
        "$or": [
          { "documentData._id": _id },
          { "documentData.ancestors": _id }
        ]
      }).observe({
        added: (revision) => {
          this.added("Revisions", revision._id, revision);
          if (revision.documentType === "product") {
            // Check merge box (session collection view), if product is already in cache.
            // If yes, we send a `changed`, otherwise `added`. I'm assuming
            // that this._documents.Products is somewhat equivalent to the
            // merge box Meteor.server.sessions[sessionId].getCollectionView("Products").documents
            if (this._documents.Products && this._documents.Products[revision.documentId]) {
              this.changed("Products", revision.documentId, { __revisions: [revision] });
            } else {
              this.added("Products", revision.documentId, { __revisions: [revision] });
            }
          }
        },
        changed: (revision) => {
          this.changed("Revisions", revision._id, revision);
          if (revision.documentType === "product") {
            if (this._documents.Products && this._documents.Products[revision.documentId]) {
              this.changed("Products", revision.documentId, { __revisions: [revision] });
            }
          }
        },
        removed: (revision) => {
          this.removed("Revisions", revision._id);
          if (revision.documentType === "product") {
            if (this._documents.Products && this._documents.Products[revision.documentId]) {
              this.changed("Products", revision.documentId, { __revisions: [] });
            }
          }
        }
      });
      this.onStop(() => {
        handle.stop();
      });
    }
  }

  return Products.find(selector);
});
