import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Roles } from "meteor/alanning:roles";
import { ReactiveAggregate } from "./reactiveAggregate";
import { Accounts, MediaRecords, Orders, Shops } from "/lib/collections";
import { Counts } from "meteor/tmeasday:publish-counts";
import Reaction from "/imports/plugins/core/core/server/Reaction";

/**
 * @summary A shared way of creating a projection
 * @param {String} shopId - shopId to filter records by
 * @param {Object} sort - An object containing a sort
 * @param {Number} limit - An optional limit of how many records to return
 * @param {Object} query - An optional query to match
 * @param {Number} skip - An optional limit number of records to skip
 * @returns {Array} An array of projection operators
 * @private
 */
function createAggregate(shopId, sort = { createdAt: -1 }, limit = 0, query = {}, skip = 0) {
  const aggregate = [{ $match: { "shipping.shopId": shopId, ...query } }];

  if (sort) aggregate.push({ $sort: sort });
  if (skip > 0) aggregate.push({ $skip: skip });
  if (limit > 0) aggregate.push({ $limit: limit });

  // NOTE: in Mongo 3.4 using the $in operator will be supported for projection filters
  aggregate.push({
    $project: {
      shipping: {
        $filter: {
          input: "$shipping",
          as: "shipping",
          cond: { $eq: ["$$shipping.shopId", shopId] }
        }
      },
      accountId: 1,
      cartId: 1,
      createdAt: 1,
      email: 1,
      shopId: 1,
      workflow: 1 // workflow is still stored at the top level and used to showing status
    }
  });

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
      "shipping.shopId": shopId
    }
  };
  const aggregate = createAggregate(shopId);

  if (Roles.userIsInRole(this.userId, ["admin", "owner", "orders"], shopId)) {
    ReactiveAggregate(this, Orders, aggregate, aggregateOptions);
  } else {
    const account = Accounts.findOne({ userId: this.userId });
    return Orders.find({
      accountId: account._id,
      shopId
    });
  }
});


Meteor.publish("PaginatedOrders", function (query, options) {
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
      "shipping.shopId": shopId
    }
  };
  const limit = (options && options.limit) ? options.limit : 0;
  const skip = (options && options.skip) ? options.skip : 0;
  const aggregate = createAggregate(shopId, { createdAt: -1 }, limit, query, skip);
  if (Roles.userIsInRole(this.userId, ["admin", "owner", "orders"], shopId)) {
    Counts.publish(this, "orders-count", Orders.find(), { noReady: true });
    ReactiveAggregate(this, Orders, aggregate, aggregateOptions);
  } else {
    const account = Accounts.findOne({ userId: this.userId });
    return Orders.find({
      accountId: account._id,
      shopId
    });
  }
});

/**
 * account orders
 */
Meteor.publish("AccountOrders", function (accountId) {
  check(accountId, String);

  const shopId = Reaction.getShopId();
  if (!shopId) {
    return this.ready();
  }

  const account = this.userId ? Accounts.findOne({ userId: this.userId }) : null;
  const contextAccountId = account && account._id;
  if (accountId !== contextAccountId && !Reaction.hasPermission("orders", Reaction.getUserId(), shopId)) {
    return this.ready();
  }

  const ordersCursor = Orders.find({
    accountId,
    shopId
  }, {
    sort: {
      createdAt: -1
    },
    limit: 25
  });

  const shopNamesCursor = Shops.find({}, { fields: { name: 1 } });

  return [ordersCursor, shopNamesCursor];
});

/**
 * completed cart order
 */
Meteor.publish("CompletedCartOrder", (cartId) => {
  check(cartId, String);

  const userId = Reaction.getUserId();
  const account = userId ? Accounts.findOne({ userId }) : null;
  const accountId = account && account._id;

  return Orders.find({
    accountId,
    cartId
  }, { limit: 1 });
});

Meteor.publish("OrderImages", (orderId) => {
  check(orderId, Match.Optional(String));
  if (!orderId) return [];

  const order = Orders.findOne({ _id: orderId });
  const orderItems = order.shipping.reduce((list, group) => [...list, ...group.items], []);

  // Ensure each of these are unique
  const productIds = [...new Set(orderItems.map((item) => item.productId))];
  const variantIds = [...new Set(orderItems.map((item) => item.variantId))];

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
