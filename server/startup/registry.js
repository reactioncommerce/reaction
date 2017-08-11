import { Shops } from "/lib/collections";
import { Reaction } from "/server/api";

export default function () {

  // initialize shop registry when a new shop is added
  Shops.find().observe({
    added(doc) {
      Reaction.setShopName(doc);
      Reaction.setDomain();
    },
    removed() {
      // TODO SHOP REMOVAL CLEANUP FOR #357
    }
  });
}
