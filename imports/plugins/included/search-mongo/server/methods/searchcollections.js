import _ from "lodash";
import { Packages, Products } from "/lib/collections";
import { Reaction, Logger } from "/server/api";
import { ProductSearch } from "../../lib/collections";


const requiredFields = ["_id", "hashtags", "shopId"];

function getPackageSettings() {
  const searchPackage = Packages.findOne({
    shopId: Reaction.getShopId(),
    name: "reaction-search"
  });
  return searchPackage.settings;
}

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
function getScores(customFields, settings) {
  const weightObject = {};
  for (const weight of _.keys(settings.weights)) {
    if (_.includes(customFields, weight)) {
      weightObject[weight] = settings.weights[weight];
    }
  }
  return weightObject;
}

export function getProductSearchParameters() {
  const settings = getPackageSettings();
  const customFields = filterFields(settings.includes);
  const fieldSet = requiredFields.concat(customFields);
  const weightObject = getScores(customFields, settings);
  return { fieldSet: fieldSet, weightObject: weightObject };
}

export function buildProuctSearchCollectionRecord(productId) {
  const product = Products.findOne(productId);
  const { fieldSet } = getProductSearchParameters();
  const productRecord = {};
  for (const field of fieldSet) {
    productRecord[field] = product[field];
  }
  const productSearchRecord = ProductSearch.insert(productRecord);
  return productSearchRecord;
}

export function buildProductSearchCollection() {
  Logger.info("(re)Building ProductSearch Collection");
  ProductSearch.remove({});
  const { fieldSet, weightObject } = getProductSearchParameters();
  const products = Products.find().fetch();
  for (const product of products) {
    const productRecord = {};
    for (const field of fieldSet) {
      productRecord[field] = product[field];
    }
    ProductSearch.insert(productRecord);
  }
  const rawProductSearchCollection = ProductSearch.rawCollection();
  rawProductSearchCollection.dropIndexes("*");
  rawProductSearchCollection.createIndex({"$**": "text"}, weightObject);
}
