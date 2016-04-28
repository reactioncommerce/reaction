import { Shops } from "/lib/collections";
import initRegistry from "./registry";

export default function () {
  initRegistry();

   // initialize shop registry when a new shop is added
  Shops.find().observe({
    added(doc) {
      ReactionRegistry.setShopName(doc);
      ReactionRegistry.setDomain();
    },
    removed() {
      // TODO SHOP REMOVAL CLEANUP FOR #357
    }
  });
}
