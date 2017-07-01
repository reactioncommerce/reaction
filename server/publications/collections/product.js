import { Reaction } from "/lib/api";
import { Logger } from "/server/api";
import { Media, Products, Revisions } from "/lib/collections";
import { RevisionApi } from "/imports/plugins/core/revisions/lib/api/revisions";

export function findProductMedia(publicationInstance, productIds) {
  const shopId = Reaction.getShopId();
  const selector = {};

  if (!shopId) {
    return publicationInstance.ready();
  }

  if (Array.isArray(productIds)) {
    selector["metadata.productId"] = {
      $in: productIds
    };
  } else {
    selector["metadata.productId"] = productIds;
  }

  if (shopId) {
    selector["metadata.shopId"] = shopId;
  }

  // By default only images that are not "archived"
  // and are either "published" or null are published
  selector["metadata.workflow"] = {
    $nin: ["archived"],
    $in: [null, "published"]
  };

  if (Reaction.hasPermission(["createProduct"], publicationInstance.userId)) {
    delete selector["metadata.workflow"].$in;
  }

  return Media.find(selector, {
    sort: {
      "metadata.priority": 1
    }
  });
  //  Removed SellerShopId related media publication for now.
  // const isUserOwnerOrModerator = Reaction.hasPermission(["owner", "moderator"], publicationInstance.userId);
  //
  // if (isUserOwnerOrModerator) {
  //   selector["metadata.workflow"] = { $nin: ["archived"] };
  // } else {
  //   // get seller-shop id if user is a seller;
  //   const sellerShopId = Reaction.getSellerShopId(publicationInstance.userId, true);
  //   // sellers can see unpublished images only of their shop
  //   if (sellerShopId) {
  //     selector.$or = [{
  //       "metadata.workflow": { $in: [null, "published"] }
  //     }, {
  //       "metadata.shopId": sellerShopId
  //     }];
  //   }
  // }
  //
  // return Media.find(selector, {
  //   sort: {
  //     "metadata.priority": 1
  //   }
  // });
}


/**
 * product detail publication
 * @param {String} productId - productId or handle
 * @return {Object} return product cursor
 */
Meteor.publish("Product", function (productId) {
  check(productId, Match.OptionalOrNull(String));

  if (!productId) {
    Logger.debug("ignoring null request on Product subscription");
    return this.ready();
  }

  // verify that parent shop is ready
  const shop = Reaction.getCurrentShop();
  if (typeof shop !== "object") {
    return this.ready();
  }


  let id;
  let productShopId;

  // Default selector. Any changes come via specific roles
  const selector = {
    isDeleted: { $in: [null, false] },
    isVisible: true
  };

  // Permits admins to view both visible and invisible products.
  if (Roles.userIsInRole(this.userId, ["owner", "admin", "createProduct"], shop._id)) {
    selector.isVisible = { $in: [true, false] };
  }

  // TODO review for REGEX / DOS vulnerabilities.
  if (productId.match(/^[23456789ABCDEFGHJKLMNPQRSTWXYZabcdefghijkmnopqrstuvwxyz]{17}$/)) {
    // selector._id = productId;
    // TODO try/catch here because we can have product handle passed by such regex
    id = productId;

    let product = Products.findOne({ _id: id });

    if (!product) {
      // if we didn't find the product by id, see if it was a 17 character handle
      product = Products.findOne({
        handle: {
          $regex: id,
          $options: "i"
        }
      });
    }

    if (product) {
      // Take productShopId in order to check if user can edit this product or view its revisions
      productShopId = product.shopId;

      // Ensure that the id is the productId and not the handle
      id = product._id;
    } else {
      // No Product found, return empty cursor;
      return this.ready();
    }
  } else {
    // if productId doesn't match the id regex,
    // see if there's a product with a matching handle
    const product = Products.findOne({
      handle: {
        $regex: productId,
        $options: "i"
      }
    });

    if (product) {
      id = product._id;
      productShopId = product.shopId;
    } else {
      return this.ready();
    }
  }

  // Begin selector for product
  // We don't need handle anymore(we got product's id in the previous step)
  // Try to find a product with the _is as an Random.id()
  // Try to find a product variant with _id using the ancestors array
  selector.$or = [{
    _id: id
  }, {
    ancestors: {
      $in: [id]
    }
  }];

  // Authorized content curators of the shop get special publication of the product
  // all relevant revisions all is one package
  if (Reaction.hasPermission("createProduct", this.userId, productShopId)) {
    delete selector.isVisible;
    if (RevisionApi.isRevisionControlEnabled()) {
      const productCursor = Products.find(selector);
      const productIds = productCursor.map(p => p._id);

      const handle = productCursor.observeChanges({
        added: (docId, fields) => {
          const revisions = Revisions.find({
            "documentId": docId,
            "workflow.status": {
              $nin: [
                "revision/published"
              ]
            }
          }).fetch();
          fields.__revisions = revisions;

          this.added("Products", docId, fields);
        },
        changed: (docId, fields) => {
          const revisions = Revisions.find({
            "documentId": docId,
            "workflow.status": {
              $nin: [
                "revision/published"
              ]
            }
          }).fetch();

          fields.__revisions = revisions;
          this.changed("Products", docId, fields);
        },
        removed: (docId) => {
          this.removed("Products", docId);
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
          let product;
          if (!revision.parentDocument) {
            product = Products.findOne(revision.documentId);
          } else {
            product = Products.findOne(revision.parentDocument);
          }
          if (product) {
            this.added("Products", product._id, product);
            this.added("Revisions", revision._id, revision);
          }
        },
        changed: (revision) => {
          let product;
          if (!revision.parentDocument) {
            product = Products.findOne(revision.documentId);
          } else {
            product = Products.findOne(revision.parentDocument);
          }

          if (product) {
            product.__revisions = [revision];
            this.changed("Products", product._id, product);
            this.changed("Revisions", revision._id, revision);
          }
        },
        removed: (revision) => {
          let product;
          if (!revision.parentDocument) {
            product = Products.findOne(revision.documentId);
          } else {
            product = Products.findOne(revision.parentDocument);
          }
          if (product) {
            // Empty product's __revisions only if this revision is of the actual product
            // and not of a relative document( like an image) - in that case the revision has
            // a parentDocument field.
            if (!revision.parentDocument) {
              product.__revisions = [];
              this.changed("Products", product._id, product);
            }
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
