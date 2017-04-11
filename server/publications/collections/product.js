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

  // No one needs to see archived images on products
  selector["metadata.workflow"] = {
    $nin: ["archived"]
  };

  // Product editors can see both published and unpublished images
  if (!Reaction.hasPermission(["createProduct"], publicationInstance.userId)) {
    selector["metadata.workflow"].$in = [null, "published"];
  }

  return Media.find(selector, {
    sort: {
      "metadata.priority": 1
    }
  });
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
  if (Reaction.hasPermission("createProduct", this.userId, shop._id)) {
    selector.isVisible = {
      $in: [true, false, undefined]
    };
  }
  // TODO review for REGEX / DOS vulnerabilities.
  if (productId.match(/^[23456789ABCDEFGHJKLMNPQRSTWXYZabcdefghijkmnopqrstuvwxyz]{17}$/)) {
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
  // We don't need handle anymore(we got product's id in the previous step)
  // Try to find a product with the _is as an Random.id()
  // Try to find a product variant with _id using the ancestors array
  selector.$or = [
    { _id: _id },
    {
      ancestors: {
        $in: [_id]
      }
    }
  ];

  // Authorized content curators for the shop get special publication of the product
  // all relevant revisions all is one package
  if (Reaction.hasPermission(["createProduct"], shop._id)) {
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

  // Everyone else gets the standard, visbile products and variants
  const productCursor = Products.find(selector);
  const productIds = productCursor.map(p => p._id);
  const mediaCursor = findProductMedia(this, productIds);

  return [
    productCursor,
    mediaCursor
  ];
});
