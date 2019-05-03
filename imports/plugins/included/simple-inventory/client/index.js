import { registerBlock } from "/imports/plugins/core/components/lib";
import VariantInventoryForm from "./VariantInventoryForm";
import withUpdateVariantInventoryInfo from "./withUpdateVariantInventoryInfo";
import withVariantInventoryInfo from "./withVariantInventoryInfo";

registerBlock({
  region: "VariantDetailMain",
  name: "VariantInventoryForm",
  component: VariantInventoryForm,
  hocs: [withVariantInventoryInfo, withUpdateVariantInventoryInfo],
  priority: 30
});
