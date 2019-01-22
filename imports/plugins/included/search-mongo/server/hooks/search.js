import Logger from "@reactioncommerce/logger";
import { Meteor } from "meteor/meteor";
import { ProductSearch, AccountSearch } from "/lib/collections";
import appEvents from "/imports/node-app/core/util/appEvents";
import rawCollections from "/imports/collections/rawCollections";
import {
  buildAccountSearchRecord,
  buildProductSearchRecord
} from "../methods/searchcollections";
import buildOrderSearchRecord from "../no-meteor/util/buildOrderSearchRecord";

appEvents.on("afterAccountCreate", ({ account }) => {
  if (AccountSearch && !Meteor.isAppTest) {
    // Passing forceIndex will run account search index even if
    // updated fields don't match a searchable field
    buildAccountSearchRecord(account._id, ["forceIndex"]);
  }
});

appEvents.on("afterAccountDelete", ({ account }) => {
  if (AccountSearch && !Meteor.isAppTest) {
    AccountSearch.remove(account._id);
  }
});

appEvents.on("afterAccountUpdate", ({ account, updatedFields }) => {
  if (AccountSearch && !Meteor.isAppTest) {
    buildAccountSearchRecord(account._id, updatedFields);
  }
});

appEvents.on("afterOrderUpdate", ({ order }) => {
  if (!Meteor.isAppTest) {
    Promise.await(buildOrderSearchRecord(rawCollections, order));
  }
});

/**
 * if product is removed, remove product search record
 * @private
 */
appEvents.on("afterProductSoftDelete", ({ product }) => {
  if (ProductSearch && !Meteor.isAppTest && product.type === "simple") {
    const productId = product._id;
    ProductSearch.remove({ _id: productId });
    Logger.debug(`Removed product ${productId} from ProductSearch collection`);
  }
});

/**
 * @summary Rebuild search record when product is published
 */
appEvents.on("afterPublishProductToCatalog", ({ product }) => {
  Logger.debug(`Rewriting search record for ${product.title}`);
  ProductSearch.remove({ _id: product._id });
  buildProductSearchRecord(product._id);
});
