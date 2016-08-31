/* global Asset */
import faker from "faker";
import {EJSON} from "meteor/ejson";
import {Products, Tags} from "/lib/collections";
import {Hooks, Logger} from "/server/api";

Hooks.Events.add("afterCoreInit", () => {
  for (let i = 1; i < 1000; i++) {
    Logger.info("Inserting product: ", i);
    createProduct();
  }
  // const existingDoc = Products.find().count();
  // if (existingDoc === 4) {
  //   Logger.warn("======> Adding Search Products");
  //   // noinspection JSUnresolvedVariable
  //   const tagsJson = Assets.getText("custom/SearchTags.json");
  //   const tagsData = EJSON.parse(tagsJson);
  //   for (const tag of tagsData) {
  //     Tags.insert(tag);
  //   }
  //   // noinspection JSUnresolvedVariable
  //   const productJson = Assets.getText("custom/SearchProducts.json");
  //   const productData = EJSON.parse(productJson);
  //   for (const product of productData) {
  //     Products.insert(product);
  //   }
  // } else {
  //   Logger.warn(`Not adding search products, there are ${existingDoc} products`);
  // }
});

export function createProduct() {
  const product = {
    "ancestors": [],
    "shopId": "J8Bhq3uTtdgwZx3rz",
    "title": "Vans Men's Suede Sk-8 Hi Shoe",
    "pageTitle": "Nesciunt itaque modi soluta sint sint.",
    "description": "This shoe is so rad that it was brought back to life from the past so that you can wear it yourself.",
    "type": "simple",
    "vendor": "Vans",
    "price": {
      "range": "24.99",
      "min": 24.99,
      "max": 24.99
    },
    "isLowQuantity": false,
    "isSoldOut": false,
    "isBackorder": false,
    "metafields": [
      {
        "key": "Material",
        "value": "Canvas"
      },
      {
        "key": "Sole",
        "value": "Rubber"
      }
    ],
    "requiresShipping": true,
    "hashtags": [],
    "isVisible": true,
    "handle": "vans-men-s-suede-sk-8-hi-shoe",
    "workflow": {
      "status": "new"
    }
  };
  const insertedProduct = Products.insert(product);
  return insertedProduct;
}

