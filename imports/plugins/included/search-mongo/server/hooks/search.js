import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { Products, ProductSearch, OrderSearch, AccountSearch } from "/lib/collections";
import {
  getSearchParameters,
  buildAccountSearchRecord,
  buildOrderSearchRecord,
  buildProductSearchRecord
} from "../methods/searchcollections";
import { Hooks, Logger } from "/server/api";

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

Hooks.Events.add("afterOrderInsert", (doc) => {
  if (OrderSearch && !Meteor.isAppTest) {
    const orderId = doc._id;
    buildOrderSearchRecord(orderId);
  }

  return doc;
});

Hooks.Events.add("afterUpdateOrderUpdateSearchRecord", (order) => {
  if (OrderSearch && !Meteor.isAppTest) {
    const orderId = order._id;
    OrderSearch.remove(orderId);
    buildOrderSearchRecord(orderId);
  }
});

/**
 * if product is removed, remove product search record
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
* after product update rebuild product search record
*/
Hooks.Events.add("afterUpdateCatalogProduct", (doc, options) => {
  // Find the most recent version of the product document based on
  // the passed in doc._id
  const productDocument = Products.findOne({
    _id: doc._id
  });

  // If this hook is ran without options, then this callback
  // should no be executed.
  if (!options) {
    return productDocument;
  }

  const { modifier: { $set: allProps } } = options;
  const topLevelFieldNames = Object.getOwnPropertyNames(allProps);

  if (ProductSearch && !Meteor.isAppTest && productDocument.type === "simple") {
    const productId = productDocument._id;
    const { fieldSet } = getSearchParameters();
    const modifiedFields = _.intersection(fieldSet, topLevelFieldNames);
    if (modifiedFields.length) {
      Logger.debug(`Rewriting search record for ${productDocument.title}`);
      ProductSearch.remove(productId);
      if (!productDocument.isDeleted) { // do not create record if product was archived
        buildProductSearchRecord(productId);
      }
    } else {
      Logger.debug("No watched fields modified, skipping");
    }
  }

  return productDocument;
});

/**
 * after insert
 * @summary should fires on create new variants, on clones products/variants
 */
Hooks.Events.add("afterInsertProduct", (doc) => {
  if (ProductSearch && !Meteor.isAppTest && doc.type === "simple") {
    const productId = doc._id;
    buildProductSearchRecord(productId);
    Logger.debug(`Added product ${productId} to ProductSearch`);
  }

  return doc;
});
