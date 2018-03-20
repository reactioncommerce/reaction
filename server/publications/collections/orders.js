import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Roles } from "meteor/alanning:roles";
import { ReactiveAggregate } from "./reactiveAggregate";
import { MediaRecords, Orders } from "/lib/collections";
import { Reaction } from "/server/api";


/**
 * A shared way of creating a projection
 * @param {String} shopId - shopId to filter records by
 * @param {Object} sort - An object containing a sort
 * @param {Number} limit - An optional limit of how many records to return
 * @returns {Array} An array of projection operators
 * @private
 */
function createAggregate(shopId, sort = { createdAt: -1 }, limit = 0) {
  // NOTE: in Mongo 3.4 using the $in operator will be supported for projection filters
  const aggregate = [
    { $match: { "items.shopId": shopId } },
    {
      $project: {
        items: {
          $filter: {
            input: "$items",
            as: "item",
            cond: { $eq: ["$$item.shopId", shopId] }
          }
        },
        billing: {
          $filter: {
            input: "$billing",
            as: "billing",
            cond: { $eq: ["$$billing.shopId", shopId] }
          }
        },
        shipping: {
          $filter: {
            input: "$shipping",
            as: "shipping",
            cond: { $eq: ["$$shipping.shopId", shopId] }
          }
        },
        cartId: 1,
        sessionId: 1,
        shopId: 1, // workflow is still stored at the top level and used to showing status
        workflow: 1,
        discount: 1,
        tax: 1,
        email: 1,
        createdAt: 1,
        userId: 1
      }
    },
    { $sort: sort }
  ];

  if (limit > 0) {
    aggregate.push({ $limit: limit });
  }
  return aggregate;
}

Meteor.publish("Orders", function () {
  if (this.userId === null) {
    return this.ready();
  }
  const shopId = Reaction.getShopId();
  if (!shopId) {
    return this.ready();
  }

  // return any order for which the shopId is attached to an item
  const aggregateOptions = {
    observeSelector: {
      "items.shopId": shopId
    }
  };
  const aggregate = createAggregate(shopId);

  if (Roles.userIsInRole(this.userId, ["admin", "owner", "orders"], shopId)) {
    ReactiveAggregate(this, Orders, aggregate, aggregateOptions);
  } else {
    return Orders.find({
      shopId,
      userId: this.userId
    });
  }
});

/**
 * paginated orders
 */

Meteor.publish("PaginatedOrders", function (limit) {
  check(limit, Number);

  if (this.userId === null) {
    return this.ready();
  }
  const shopId = Reaction.getUserShopId(this.userId) || Reaction.getShopId();
  if (!shopId) {
    return this.ready();
  }
  // return any order for which the shopId is attached to an item
  const aggregateOptions = {
    observeSelector: {
      "items.shopId": shopId
    }
  };
  const aggregate = createAggregate(shopId, { createdAt: -1 }, limit);

  if (Roles.userIsInRole(this.userId, ["admin", "owner", "orders"], shopId)) {
    ReactiveAggregate(this, Orders, aggregate, aggregateOptions);
  } else {
    return Orders.find({
      shopId,
      userId: this.userId
    });
  }
});

Meteor.publish("CustomPaginatedOrders", function (query, options) {
  check(query, Match.Optional(Object));
  check(options, Match.Optional(Object));

  if (this.userId === null) {
    return this.ready();
  }
  const shopId = Reaction.getUserShopId(this.userId) || Reaction.getShopId();
  if (!shopId) {
    return this.ready();
  }

  // return any order for which the shopId is attached to an item
  const aggregateOptions = {
    observeSelector: {
      "items.shopId": shopId
    }
  };
  const aggregate = createAggregate(shopId);
  if (Roles.userIsInRole(this.userId, ["admin", "owner", "orders"], shopId)) {
    ReactiveAggregate(this, Orders, aggregate, aggregateOptions);
  } else {
    return Orders.find({
      shopId,
      userId: this.userId
    });
  }
});

/**
 * account orders
 */
Meteor.publish("AccountOrders", function (userId, currentShopId) {
  check(userId, String);
  check(currentShopId, Match.OptionalOrNull(String));

  if (this.userId === "") {
    return this.ready();
  }
  const shopId = currentShopId || Reaction.getShopId();
  if (!shopId) {
    return this.ready();
  }
  return Orders.find({
    userId,
    shopId
  });
});

/**
 * completed cart order
 */
Meteor.publish("CompletedCartOrder", function (userId, cartId) {
  check(userId, Match.OneOf(String, null));
  check(cartId, String);
  if (this.userId === null) {
    return this.ready();
  }
  if (typeof userId === "string" && userId !== this.userId) {
    return this.ready();
  }

  return Orders.find({
    cartId,
    userId
  });
});

Meteor.publish("OrderImages", (orderId) => {
  check(orderId, Match.Optional(String));
  if (!orderId) return [];

  const order = Orders.findOne(orderId);
  const { items: orderItems } = order || {};
  if (!Array.isArray(orderItems)) return [];

  // Ensure each of these are unique
  const productIds = [...new Set(orderItems.map((item) => item.product._id))];
  const variantIds = [...new Set(orderItems.map((item) => item.variants._id))];

  // return image for each the top level product or the variant and let the client code decide which to display
  return MediaRecords.find({
    "$or": [
      {
        "metadata.productId": {
          $in: productIds
        }
      },
      {
        "metadata.variantId": {
          $in: variantIds
        }
      }
    ],
    "metadata.workflow": {
      $nin: ["archived", "unpublished"]
    }
  });
});
