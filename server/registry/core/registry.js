import { Shops } from "/lib/collections";

/*
 * ReactionRegistry is a global server object that it can be reused in packages
 * assumes collection data in reaction-core/private/data, optionally jsonFile
 * use jsonFile when calling from another package, as we can't read the assets from here
 */

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
