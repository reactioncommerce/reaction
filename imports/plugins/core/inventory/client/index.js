import { registerBlock } from "/imports/plugins/core/components/lib";
import InventorySettings from "./InventorySettings";
import withInventoryShopSettings from "./withInventoryShopSettings";
import withUpdateInventoryShopSettings from "./withUpdateInventoryShopSettings";

registerBlock({
  region: "ShopSettings",
  name: "InventorySettings",
  component: InventorySettings,
  hocs: [
    withInventoryShopSettings,
    withUpdateInventoryShopSettings
  ],
  priority: 10
});
