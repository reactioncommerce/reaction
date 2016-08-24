/* global Asset */
import { EJSON } from "meteor/ejson";
import { Products, Tags } from "/lib/collections";
import { Hooks, Logger } from "/server/api";

Hooks.Events.add("afterCoreInit", () => {
  const existingDoc = Products.find().count();
  if (existingDoc === 4) {
    Logger.warn("======> Adding Search Products");
    // noinspection JSUnresolvedVariable
    const tagsJson = Assets.getText("custom/SearchTags.json");
    const tagsData = EJSON.parse(tagsJson);
    for (const tag of tagsData) {
      Tags.insert(tag);
    }
    // noinspection JSUnresolvedVariable
    const productJson = Assets.getText("custom/SearchProducts.json");
    const productData = EJSON.parse(productJson);
    for (const product of productData) {
      Products.insert(product);
    }
    // Hide the default product
    Products.update({_id: "BCTMZ6HTxFSppJESk"}, {
      $set: {
        isVisible: false
      }
    });
  } else {
    Logger.warn(`Not adding search products, there are ${existingDoc} products`);
  }
});

Hooks.Events.add("afterCoreInit", () => {
  Logger.info("Building ProductSearch Collection");
  const fieldSet = ["_id", "title", "description", "type", "vendor", "shopId"];
  const ProductSearch = new Mongo.Collection("ProductSearch");
  ProductSearch.remove({});
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
  rawProductSearchCollection.createIndex({"$**": "text"}, {weights: { title: 3, description: 1 }});
});
