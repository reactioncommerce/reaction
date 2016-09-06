import _ from "lodash";
import { check, Match } from "meteor/check";
import { Reaction, Logger } from "/server/api";
import { ProductSearch, OrderSearch, AccountSearch, Orders, Products, Accounts } from "/lib/collections";
import utils from "./common";


const productRequiredFields = ["_id", "hashtags", "shopId", "handle", "price", "isVisible"];

function filterFields(customFields) {
  const fieldNames = [];
  const fieldKeys = _.keys(customFields);
  for (const fieldKey of fieldKeys) {
    if (customFields[fieldKey]) {
      fieldNames.push(fieldKey);
    }
  }
  return fieldNames;
}

// get the weights for all enabled fields
function getScores(customFields, settings, collection = "products") {
  const weightObject = {};
  for (const weight of _.keys(settings[collection].weights)) {
    if (_.includes(customFields, weight)) {
      weightObject[weight] = settings[collection].weights[weight];
    }
  }
  return weightObject;
}

export function getSearchParameters(collection = "products") {
  const settings = utils.getPackageSettings();
  const customFields = filterFields(settings[collection].includes);
  const fieldSet = productRequiredFields.concat(customFields);
  const weightObject = getScores(customFields, settings);
  return { fieldSet: fieldSet, weightObject: weightObject, customFields: customFields };
}

export function buildProductSearchRecord(productId) {
  const product = Products.findOne(productId);
  if (product.type === "simple" && product.isVisible) {
    const { fieldSet } = getSearchParameters();
    const productRecord = {};
    for (const field of fieldSet) {
      productRecord[field] = product[field];
    }
    const productSearchRecord = ProductSearch.insert(productRecord);
    ensureProductSearchIndex();
    return productSearchRecord;
  }
  return undefined;
}

export function buildProductSearch(cb) {
  check(cb, Match.Optional(Function));
  Logger.info("Start (re)Building ProductSearch Collection");
  ProductSearch.remove({});
  const { fieldSet, weightObject, customFields } = getSearchParameters();
  const products = Products.find({type: "simple"}).fetch();
  for (const product of products) {
    const productRecord = {};
    for (const field of fieldSet) {
      productRecord[field] = product[field];
    }
    ProductSearch.insert(productRecord);
  }
  const indexObject = {};
  for (const field of customFields) {
    indexObject[field] = "text";
  }
  const rawProductSearchCollection = ProductSearch.rawCollection();
  rawProductSearchCollection.dropIndexes("*");
  rawProductSearchCollection.createIndex(indexObject, weightObject);
  if (cb) {
    cb();
  }
}

export function rebuildProductSearchIndex(cb) {
  check(cb, Match.Optional(Function));
  const { customFields, weightObject } = getSearchParameters();
  const indexObject = {};
  for (const field of customFields) {
    indexObject[field] = "text";
  }
  const rawProductSearchCollection = ProductSearch.rawCollection();
  rawProductSearchCollection.dropIndexes("*");
  rawProductSearchCollection.createIndex(indexObject, weightObject);
  if (cb) {
    cb();
  }
}

// this only creates the index if it doesn't already exist, `ensureIndex` is deprecated
export function ensureProductSearchIndex() {
  const { customFields, weightObject } = getSearchParameters();
  const indexObject = {};
  for (const field of customFields) {
    indexObject[field] = "text";
  }
  const rawProductSearchCollection = ProductSearch.rawCollection();
  rawProductSearchCollection.createIndex(indexObject, weightObject);
}


export function buildOrderSearch(cb) {
  check(cb, Match.Optional(Function));
  const orders = Orders.find({}).fetch();
  for (const order of orders) {
    const orderSearch = {
      _id: order._id,
      shippingName: order.shipping[0].address.fullName,
      billingName: order.billing[0].address.fullName
    };
    OrderSearch.insert(orderSearch);
  }
  const rawOrderSearchCollection = OrderSearch.rawCollection();
  rawOrderSearchCollection.dropIndexes("*");
  rawOrderSearchCollection.createIndex({"$**": "text"}, {shippingName: 5, billingName: 5});
  if (cb) {
    cb();
  }
}

export function buildOrderSearchRecord(orderId, cb) {
  const order = Orders.findOne(orderId);
  const shopId = Reaction.getShopId();
  const orderSearch = {
    _id: order._id,
    shopId: shopId,
    shippingName: order.shipping[0].address.fullName,
    billingName: order.billing[0].address.fullName
  };
  OrderSearch.insert(orderSearch);
  const rawOrderSearchCollection = OrderSearch.rawCollection();
  rawOrderSearchCollection.createIndex({"$**": "text"}, {shippingName: 5, billingName: 5});
  if (cb) {
    cb();
  }
}

export function buildAccountSearch(cb) {
  check(cb, Match.Optional(Function));
  const accounts = Accounts.find({}).fetch();
  for (const account of accounts) {
    const accountSearch = {
      _id: account._id,
      emails: account.emails,
      profile: account.profile
    };
    AccountSearch.insert(accountSearch);
  }
  const rawAccountSearchCollection = AccountSearch.rawCollection();
  rawAccountSearchCollection.dropIndexes("*");
  rawAccountSearchCollection.createIndex({"$**": "text"});
  if (cb) {
    cb();
  }
}

export function buildAccountSearchRecord(accountId, cb) {
  check(accountId, String);
  check(cb, Match.Optional(Function));
  const account = Accounts.findOne(accountId);
  const accountSearch = {
    _id: account._id,
    emails: account.emails,
    profile: account.profile
  };
  AccountSearch.insert(accountSearch);
  const rawAccountSearchCollection = AccountSearch.rawCollection();
  rawAccountSearchCollection.createIndex({"$**": "text"});
  if (cb) {
    cb();
  }
}

