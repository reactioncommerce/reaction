import Hooks from "@reactioncommerce/hooks";
import Logger from "@reactioncommerce/logger";
import { Meteor } from "meteor/meteor";
import { ProductSearch, AccountSearch } from "/lib/collections";
import rawCollections from "/imports/collections/rawCollections";
import {
  buildAccountSearchRecord,
  buildProductSearchRecord
} from "../methods/searchcollections";
import buildOrderSearchRecord from "../no-meteor/util/buildOrderSearchRecord";

Hooks.Events.add("afterAccountsInsert", (userId, accountId) => {
  if (AccountSearch && !Meteor.isAppTest) {
    // Passing forceIndex will run account search index even if
    // updated fields don't match a searchable field
    buildAccountSearchRecord(accountId, ["forceIndex"]);
  }
});

Hooks.Events.add("afterAccountsRemove", (userId, accountId) => {
  if (AccountSearch && !Meteor.isAppTest) {
    AccountSearch.remove(accountId);
  }
});

Hooks.Events.add("afterAccountsUpdate", (userId, updateData) => {
  const { accountId, updatedFields } = updateData;

  if (AccountSearch && !Meteor.isAppTest) {
    buildAccountSearchRecord(accountId, updatedFields);
  }
});


// NOTE: this hooks does not seemed to get fired, are there is no way
// to delete an order, only cancel.
// TODO: Verify the assumption above.
// Orders.after.remove((userId, doc) => {
//   if (OrderSearch && !Meteor.isAppTest) {
//     OrderSearch.remove(doc._id);
//   }
// });

Hooks.Events.add("afterUpdateOrderUpdateSearchRecord", (order) => {
  if (!Meteor.isAppTest) {
    Promise.await(buildOrderSearchRecord(rawCollections, order));
  }
});

/**
 * if product is removed, remove product search record
 * @private
 */
Hooks.Events.add("afterRemoveProduct", (doc) => {
  if (ProductSearch && !Meteor.isAppTest && doc.type === "simple") {
    const productId = doc._id;
    ProductSearch.remove(productId);
    Logger.debug(`Removed product ${productId} from ProductSearch collection`);
  }

  return doc;
});

/**
 * @summary Rebuild search record when product is published
 */
Hooks.Events.add("afterPublishProductToCatalog", (product) => {
  Logger.debug(`Rewriting search record for ${product.title}`);
  ProductSearch.remove({ _id: product._id });
  buildProductSearchRecord(product._id);
});

/**
 * after insert
 * @summary should fires on create new variants, on clones products/variants
 * @private
 */
Hooks.Events.add("afterInsertProduct", (doc) => {
  if (ProductSearch && !Meteor.isAppTest && doc.type === "simple") {
    const productId = doc._id;
    buildProductSearchRecord(productId);
    Logger.debug(`Added product ${productId} to ProductSearch`);
  }

  return doc;
});
