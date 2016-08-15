//
// import { Hooks, Reaction, Logger } from "/server/api";
// import { Products } from "/lib/collections";
// import { EJSON } from "meteor/ejson";
//
// Hooks.Events.add("afterCoreInit", () => {
//   Logger.info("======> Adding Search Products");
//   const existingDoc = Products.find("tftRbzc6Pic7NyCkg");
//   if (!existingDoc) {
//     let productJson = Assets.getText("data/SearchProducts.json");
//     const productData = EJSON.parse(productJson);
//     for (let product of productData) {
//       Logger.info(product.shopId);
//       // Products.insert(product);
//     }
//   }
//
//   // Reaction.Import.fixture().process(productJson, ["title"], Reaction.Import.product);
//   // Reaction.Import.flush();
// });
