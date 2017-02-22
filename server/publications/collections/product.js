import { Reaction } from "/lib/api";
import { Logger } from "/server/api";
import { Products, Revisions } from "/lib/collections";
import { RevisionApi } from "/imports/plugins/core/revisions/lib/api/revisions";

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

  const shop = Reaction.getSellerShop(this.userId);
  // verify that shop is ready
  if (typeof shop !== "object") {
    return this.ready();
  }

  let _id;

  // selector should come first as default, alterations take place later depending on role
  const selector = {
    isVisible: true,
    isDeleted: { $in: [null, false] }
  };

  // no need for admin, simple perm should be ok per group
  if (Roles.userIsInRole(this.userId, ["createProduct"], shop._id)) {
    selector.isVisible = {
      $in: [true, false]
    };
  }
  // TODO review for REGEX / DOS vulnerabilities.
  if (productId.match(/^[23456789ABCDEFGHJKLMNPQRSTWXYZabcdefghijkmnopqrstuvwxyz]{17}$/)) {
    // selector._id = productId;
    // TODO try/catch here because we can have product handle passed by such regex
    _id = productId;
  } else {
    const newSelector = Object.assign({}, selector, {
      handle: {
        $regex: productId,
        $options: "i"
      }
    });

    const products = Products.find(newSelector).fetch();
    if (products.length > 0) {
      _id = products[0]._id;
    } else {
      return this.ready();
    }
  }

  // Selector for product
  // Try to find a product with _id as a handle "example-product"
  // Try to find a product with the _is as an Random.id()
  // Try to find a product variant with _id using the ancestors array
  selector.$or = [
    { handle: { $regex: _id, $options: "i" } },
    { _id: _id },
    {
      ancestors: {
        $in: [_id]
      }
    }
  ];

  // Authorized content curators for the shop get special publication of the product
  // all relevant revisions all is one package
  if (Roles.userIsInRole(this.userId, ["admin", "createProduct"], shop._id)) {
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
            product.__revisions = [];
            this.changed("Products", product._id, product);
            this.removed("Revisions", revision._id, revision);
          }
        }
      });

      this.onStop(() => {
        handle.stop();
        handle2.stop();
      });

      return this.ready();
    }

    // Revision control is disabled
    return Products.find(selector);
  }

  // Everyone else gets the standard, visible products and variants
  return Products.find(selector);
});
