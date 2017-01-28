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
    Logger.debug("ignoring null request on Product subscription");
    return this.ready();
  }
  let _id;
  let shopId;

  if (this.userId) {
    // get shop for loggedIn user or parent shop as fallback
    shopId = Roles.getGroupsForUser(this.userId, "admin")[0] || null;
  }

  const shop = Reaction.getCurrentShop(shopId);
  // verify that shop is ready
  if (typeof shop !== "object") {
    return this.ready();
  }

  // selector for hih - What's hih?
  // selector should come first as default, alterations take place later depending on role
  let selector = {
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
      {handle: _id},
      {_id: _id},
      {
        ancestors: {
          $in: [_id]
        }
      }
    ]
  };

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

            // When adding a new product as a guest seller and then edit that product
            // the new product cannot be found in the Products collection when fields are changed
            // and this.changed("Products") returns an error below
            // The product does however exist in the collection
            // Note that sometimes it works **right after registering** and becoming a seller, we can post a product successfully
            // RC to investigate
            // Possible cause? https://github.com/meteor/meteor/issues/1354
            // console.log(Products.find({_id:product._id}).fetch());
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
