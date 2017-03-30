import { Media, Products, Revisions } from "/lib/collections";
import { Logger, Reaction } from "/server/api";
import { RevisionApi } from "/imports/plugins/core/revisions/lib/api/revisions";
import { getProductMedia } from "/lib/api/media";

export function fetchRevisions(documentId) {
  return Revisions.find({
    "documentId": documentId,
    "workflow.status": {
      $nin: [
        "revision/published"
      ]
    }
  }).fetch();
}

export function fetchAllProductData(productId) {
  const product = Products.findOne(productId);

  product.__revisions = fetchRevisions(product._id);
  product.media = getProductMedia({ productId: product._id, getRevisions: true });

  return product;
}

export function fetchPublicProductData(productId) {
  const product = Products.findOne(productId);

  product.media = getProductMedia({ productId: product._id });

  return product;
}

export function createMediaSelector() {
  let selector;

  const shopId = Reaction.getShopId();
  if (!shopId) {
    return false;
  }

  if (shopId) {
    selector = {
      "metadata.shopId": shopId
    };
  }

  // Product editors can see both published and unpublished images
  if (!Reaction.hasPermission(["createProduct"], this.userId)) {
    selector["metadata.workflow"] = {
      $in: [null, "published"]
    };
  } else {
    // but no one gets to see archived images
    selector["metadata.workflow"] = {
      $nin: ["archived"]
    };
  }
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
  let _id;
  const shop = Reaction.getCurrentShop();
  // verify that shop is ready
  if (typeof shop !== "object") {
    return this.ready();
  }

  let selector = {};

  selector.isVisible = true;
  selector.isDeleted = { $in: [null, false] };

  if (Roles.userIsInRole(this.userId, ["owner", "admin", "createProduct"], shop._id)) {
    selector.isVisible = {
      $in: [true, false]
    };
  }
  // TODO review for REGEX / DOS vulnerabilities.
  if (productId.match(/^[23456789ABCDEFGHJKLMNPQRSTWXYZabcdefghijkmnopqrstuvwxyz]{17}$/)) {
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

  // Selector for product?
  selector = {
    isVisible: true,
    isDeleted: { $in: [null, false] },
    $or: [
      { handle: _id },
      { _id: _id },
      {
        ancestors: {
          $in: [_id]
        }
      }
    ]
  };

  // Authorized content curators fo the shop get special publication of the product
  // all all relevant revisions all is one package
  if (Roles.userIsInRole(this.userId, ["owner", "admin", "createProduct"], shop._id)) {
    selector.isVisible = {
      $in: [true, false, undefined]
    };

    if (RevisionApi.isRevisionControlEnabled()) {
      const handle = Products.find(selector).observeChanges({
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
          fields.media = getProductMedia({ productId: id, getRevisions: true });

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
          fields.media = getProductMedia({ productId: id, getRevisions: true });

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
          let product;

          if (!revision.parentDocument) {
            product = Products.findOne(revision.documentId);
          } else {
            product = Products.findOne(revision.parentDocument);
          }

          if (product) {
            product.media = getProductMedia({ productId: product._id, getRevisions: true });

            this.changed("Products", product._id, product);
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
            product.media = getProductMedia({ productId: product._id, getRevisions: true });

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
            product.__revisions = [];
            this.changed("Products", product._id, product);
            this.removed("Revisions", revision._id, revision);
          }
        }
      });

      const mediaHandle = Media.files.find({
        "$or": [
          { "metadata.productId": _id },
          { "metadata.variantId": _id }
        ],
        "metadata.workflow": {
          $nin: ["archived"]
        }
      }).observe({
        added: (media) => {
          if (media.metadata && media.metadata.variantId) {
            const product = fetchAllProductData(media.metadata.variantId);
            this.changed("Products", media.metadata.variantId, product);
          }

          this.added("Media", media._id, media);
        },
        changed: (media) => {
          if (media.metadata && media.metadata.variantId) {
            const product = fetchAllProductData(media.metadata.variantId);
            this.changed("Products", media.metadata.variantId, product);
          }

          this.changed("Media", media._id, media);
        },
        removed: (media) => {
          if (media.metadata && media.metadata.variantId) {
            const product = fetchAllProductData(media.metadata.variantId);
            this.changed("Products", media.metadata.variantId, product);
          }

          this.removed("Media", media._id, media);
        }
      });

      this.onStop(() => {
        handle.stop();
        handle2.stop();
        mediaHandle.stop();
      });

      return this.ready();
    }

    // Revision control is disabled
    return Products.find(selector);
  }

  // Everyone else gets the standard, visibile products and variants
  const handle = Products.find(selector).observe({
    added: (product) => {
      product.media = getProductMedia({ productId: product._id });

      this.added("Products", product._id, product);
    },
    changed: (product) => {
      product.media = getProductMedia({ productId: product._id });

      this.changed("Products", product._id, product);
    },
    removed: (product) => {
      this.removed("Products", product._id, product);
    }
  });

  const mediaHandle = Media.files.find({
    "$or": [
      { "metadata.productId": _id },
      { "metadata.variantId": _id }
    ],
    "metadata.workflow": "published"
  }).observe({
    added: (media) => {
      if (media.metadata && media.metadata.variantId) {
        const product = fetchPublicProductData(media.metadata.variantId);
        this.changed("Products", media.metadata.variantId, product);
      }

      this.added("Media", media._id, media);
    },
    changed: (media) => {
      if (media.metadata && media.metadata.variantId) {
        const product = fetchPublicProductData(media.metadata.variantId);
        this.changed("Products", media.metadata.variantId, product);
      }

      this.changed("Media", media._id, media);
    },
    removed: (media) => {
      if (media.metadata && media.metadata.variantId) {
        const product = fetchPublicProductData(media.metadata.variantId);
        this.changed("Products", media.metadata.variantId, product);
      }

      this.removed("Media", media._id, media);
    }
  });


  this.onStop(() => {
    handle.stop();
    mediaHandle.stop();
  });

  return this.ready();
});
