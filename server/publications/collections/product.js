import { Products, Revisions } from "/lib/collections";
import { Logger, Reaction } from "/server/api";
import { RevisionApi } from "/imports/plugins/core/revisions/lib/api/revisions";

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
  const shop = Reaction.getCurrentShop();
  // verify that shop is ready
  if (typeof shop !== "object") {
    return this.ready();
  }

  let selector = {};
  selector.isVisible = true;
  selector.isDeleted = {$in: [null, false]};

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

  // Selector for hih?
  selector = {
    isVisible: true,
    isDeleted: {$in: [null, false]},
    $or: [
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
          this.added("Revisions", revision._id, revision);
        },
        changed: (revision) => {
          const product = Products.findOne(revision.documentId);

          product.__revisions = [revision];

          this.changed("Products", product._id, product);
          this.changed("Revisions", revision._id, revision);
        },
        removed: (revision) => {
          const product = Products.findOne(revision.documentId);

          product.__revisions = [];

          this.changed("Products", product._id, product);
          this.removed("Revisions", revision._id, revision);
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

  // Everyone else gets the standard, visibile products and variants
  return Products.find(selector);
});
