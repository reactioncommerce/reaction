/* global Asset */
import faker from "faker";
import { EJSON } from "meteor/ejson";
import { Products, Tags } from "/lib/collections";
import { Reaction, Hooks, Logger } from "/server/api";
import { getSlug } from "/lib/api";

Hooks.Events.add("afterCoreInit", () => {
  // for (let i = 1; i < 200; i++) {
  //   Logger.info("Inserting product: ", i);
  //   createProduct();
  // }
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
  } else {
    Logger.warn(`Not adding search products, there are ${existingDoc} products`);
  }
});

// This function is for testing a lot of products
export function createProduct() {
  const productTitle = faker.commerce.productName();
  const productSlug = getSlug(productTitle);
  const product = {
    ancestors: [],
    shopId: Reaction.getShopId(),
    title: productTitle,
    pageTitle: faker.lorem.sentence(),
    description: faker.lorem.paragraph(),
    type: "simple",
    vendor: faker.company.companyName(),
    price: {
      range: "24.99",
      min: 24.99,
      max: 24.99
    },
    isLowQuantity: false,
    isSoldOut: false,
    isBackorder: false,
    metafields: [
      {
        key: "Material",
        value: "Canvas"
      },
      {
        key: "Sole",
        value: "Rubber"
      }
    ],
    requiresShipping: true,
    hashtags: [],
    isVisible: true,
    handle: productSlug,
    workflow: {
      status: "new"
    }
  };
  const insertedProduct = Products.insert(product);
  return insertedProduct;
}
