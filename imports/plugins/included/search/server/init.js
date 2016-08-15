import faker from "faker";
import { EJSON } from "meteor/ejson";
import { Products } from "/lib/collections";
import { Hooks, Logger } from "/server/api";

Hooks.Events.add("afterCoreInit", () => {
  Logger.info("======> Adding Search Products");
  const existingDoc = Products.find().count();
  if (existingDoc === 4) {
    // noinspection JSUnresolvedVariable
    let productJson = Assets.getText("custom/SearchProducts.json");
    const productData = EJSON.parse(productJson);
    for (let product of productData) {
      product.description = faker.commerce.productAdjective();
      Products.insert(product);
    }
  }
});
