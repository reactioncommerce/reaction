import { Hooks, Logger } from "/server/api";
import { Products, Inventory } from "/lib/collections";
import { registerInventory } from "../methods/inventory";

// On first-time startup init the Inventory collection with entries for each product
Hooks.Events.add("afterCoreInit", () => {
  // If we already have any inventory record, skip
  const inventory = Inventory.find().count();
  if (!inventory) {
    const products = Products.find().fetch();
    for (const product of products) {
      Logger.debug(`Registering product ${product.title}`);
      registerInventory(product);
    }
  }
});
