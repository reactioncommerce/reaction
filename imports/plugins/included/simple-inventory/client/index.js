import { withComponents } from "@reactioncommerce/components-context";
import { registerBlock } from "/imports/plugins/core/components/lib";
import VariantInventoryForm from "./VariantInventoryForm";
import withRecalculateReservedSimpleInventory from "./withRecalculateReservedSimpleInventory";
import withUpdateVariantInventoryInfo from "./withUpdateVariantInventoryInfo";
import withVariantInventoryInfo from "./withVariantInventoryInfo";

registerBlock({
  region: "VariantDetailMain",
  name: "VariantInventoryForm",
  component: VariantInventoryForm,
  hocs: [
    withVariantInventoryInfo,
    withUpdateVariantInventoryInfo,
    withRecalculateReservedSimpleInventory,
    withComponents
  ],
  priority: 30
});
