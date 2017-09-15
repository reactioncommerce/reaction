import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Roles } from "meteor/alanning:roles";
import { Counts } from "meteor/tmeasday:publish-counts";
import { ReactiveAggregate } from "./reactiveAggregate";
import { Orders } from "/lib/collections";
import { Reaction } from "/server/api";


const filteredOrdersProjection = [
  {
    $project: {
      items: {
        $filter: {
          input: "$items",
          as: "item",
          cond: { $eq: ["$$item.shopId", "J8Bhq3uTtdgwZx3rz"] }
        }
      },
      billing: {
        $filter: {
          input: "$billing",
          as: "billing",
          cond: { $eq: ["$$billing.shopId", "J8Bhq3uTtdgwZx3rz"] }
        }
      },
      shipping: {
        $filter: {
          input: "$shipping",
          as: "shipping",
          cond: { $eq: ["$$shipping.shopId", "J8Bhq3uTtdgwZx3rz"] }
        }
      },
      cartId: 1,
      sessionId: 1,
      shopId: 1,
      workflow: 1,
      discount: 1,
      tax: 1,
      email: 1,
      createdAt: 1
    }
  }
];

/**
 * orders
 */

Meteor.publish("Orders", function () {
  if (this.userId === null) {
    return this.ready();
  }
  const shopId = Reaction.getShopId();
  if (!shopId) {
    return this.ready();
  }
  if (Roles.userIsInRole(this.userId, ["admin", "owner", "orders"], shopId)) {
    return Orders.find({
      shopId: shopId
    });
  }
  return Orders.find({
    shopId: shopId,
    userId: this.userId
  });
});

/**
 * paginated orders
 */

Meteor.publish("PaginatedOrders", function (limit) {
  check(limit, Number);

  if (this.userId === null) {
    return this.ready();
  }
  const shopId = Reaction.getShopId(this.userId);
  if (!shopId) {
    return this.ready();
  }
  if (Roles.userIsInRole(this.userId, ["admin", "owner", "orders"], shopId)) {
    Counts.publish(this, "order-count", Orders.find({ shopId: shopId }), { noReady: true });
    return Orders.find({ shopId: shopId }, { limit: limit });
  }
  return Orders.find({
    shopId: shopId,
    userId: this.userId
  });
});

Meteor.publish("CustomPaginatedOrders", function (query, options) {
  check(query, Match.Optional(Object));
  check(options, Match.Optional(Object));

  if (this.userId === null) {
    return this.ready();
  }
  const shopId = Reaction.getShopId(this.userId);
  if (!shopId) {
    return this.ready();
  }

  // return any order for which the shopId is attached to an item
  const aggregateOptions = {
    observeSelector: {
      "items.shopId": shopId
    }
  };
  if (Roles.userIsInRole(this.userId, ["admin", "owner", "orders"], shopId)) {
    ReactiveAggregate(this, Orders, filteredOrdersProjection, aggregateOptions);
  }

  // TODO How to we return this order-count
  //   Counts.publish(this, "order-count", Orders.find(selector), { noReady: true });
  return Orders.find({
    shopId: shopId,
    userId: this.userId
  });
});

/**
 * account orders
 */
Meteor.publish("AccountOrders", function (userId, currentShopId) {
  check(userId, Match.OptionalOrNull(String));
  check(currentShopId, Match.OptionalOrNull(String));
  if (this.userId === null) {
    return this.ready();
  }
  if (typeof userId === "string" && this.userId !== userId) {
    return this.ready();
  }
  const shopId = currentShopId || Reaction.getShopId();
  if (!shopId) {
    return this.ready();
  }
  return Orders.find({
    shopId: shopId,
    userId: this.userId
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
    cartId: cartId,
    userId: userId
  });
});
