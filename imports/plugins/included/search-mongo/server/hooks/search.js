import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { Products, ProductSearch, Orders, OrderSearch } from "/lib/collections";
import { getProductSearchParameters,
  buildProductSearchCollectionRecord, buildOrderSearchRecord } from "../methods/searchcollections";
import { Logger } from "/server/api";


Orders.after.remove((userId, doc) => {
  if (OrderSearch && !Meteor.isAppTest) {
    OrderSearch.remove(doc._id);
  }
});

Orders.after.insert((userId, doc) => {
  if (OrderSearch && !Meteor.isAppTest) {
    const orderId = doc._id;
    buildOrderSearchRecord(orderId);
  }
});

Orders.after.update((userId, doc) => {
  if (OrderSearch && !Meteor.isAppTest) {
    const orderId = doc._id;
    OrderSearch.remove(orderId);
    buildOrderSearchRecord(orderId);
  }
});

/**
 * if product is removed, remove product search record
 */
Products.after.remove((userId, doc) => {
  if (ProductSearch && !Meteor.isAppTest) {
    const productId = doc._id;
    ProductSearch.remove(productId);
    Logger.info(`Removed product ${productId} from ProductSearch collection`);
  }
});

//
// after product update rebuild product search record
//
Products.after.update((userId, doc, fieldNames) => {
  if (ProductSearch && !Meteor.isAppTest) {
    const productId = doc._id;
    const { fieldSet } = getProductSearchParameters();
    const modifiedFields = _.intersection(fieldSet, fieldNames);
    if (modifiedFields.length) {
      Logger.info(`Rewriting search record for ${doc.title}`);
      ProductSearch.remove(productId);
      buildProductSearchCollectionRecord(productId);
    } else {
      Logger.info("No watched fields modified, skipping");
    }
  }
});

/**
 * after insert
 * @summary should fires on create new variants, on clones products/variants
 */
Products.after.insert((userId, doc) => {
  if (ProductSearch && !Meteor.isAppTest) {
    const productId = doc._id;
    buildProductSearchCollectionRecord(productId);
  }
});
