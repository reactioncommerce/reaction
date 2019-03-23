import { registerBlock } from "../../../../core/components/lib";
import ProductHeader from "../components/ProductHeader";
import withVariantForm from "../hocs/withVariantForm";
import withProductForm from "../hocs/withProductForm";
import ProductDetailForm from "./ProductDetailForm";
import ProductMetadataForm from "./ProductMetadataForm";
import ProductSocialForm from "./ProductSocialForm";
import ProductTagForm from "./ProductTagForm";
import ProductMediaForm from "./ProductMediaForm";
import VariantTable from "./VariantTable";
import VariantList from "./VariantList";
import VariantDetailForm from "./VariantDetailForm";
import VariantTaxForm from "./VariantTaxForm";
import VariantMediaForm from "./VariantMediaForm";
import VariantInventoryForm from "./VariantInventoryForm";
import OptionTable from "./OptionTable";

// Register blocks

// ProductDetail Block: Sidebar
registerBlock({
  region: "ProductDetailSidebar",
  name: "VariantList",
  component: VariantList
});

// ProductDetail Block: Header
registerBlock({
  region: "ProductDetailHeader",
  name: "header",
  component: ProductHeader
});

// ProductDetail Block Region: Main
registerBlock({
  region: "ProductDetailMain",
  name: "ProductDetailForm",
  component: ProductDetailForm,
  hocs: [withProductForm],
  priority: 10
});

// Media gallery card and form
registerBlock({
  region: "ProductDetailMain",
  name: "ProductMediaForm",
  component: ProductMediaForm,
  priority: 20
});

registerBlock({
  region: "ProductDetailMain",
  name: "ProductSocialForm",
  component: ProductSocialForm,
  hocs: [withProductForm],
  priority: 30
});

registerBlock({
  region: "ProductDetailMain",
  name: "ProductTagForm",
  component: ProductTagForm,
  priority: 40
});

registerBlock({
  region: "ProductDetailMain",
  name: "ProductMetadataForm",
  component: ProductMetadataForm,
  hocs: [withProductForm],
  priority: 50
});

registerBlock({
  region: "ProductDetailMain",
  name: "VariantTable",
  component: VariantTable,
  priority: 60
});

registerBlock({
  region: "VariantDetailSidebar",
  name: "VariantList",
  component: VariantList
});

// Header
registerBlock({
  region: "VariantDetailHeader",
  name: "VariantHeader",
  component: ProductHeader
});

registerBlock({
  region: "VariantDetailMain",
  name: "VariantDetailForm",
  component: VariantDetailForm,
  hocs: [withVariantForm],
  priority: 10
});

registerBlock({
  region: "VariantDetailMain",
  name: "VariantMediaForm",
  component: VariantMediaForm,
  hocs: [withVariantForm],
  priority: 20
});

registerBlock({
  region: "VariantDetailMain",
  name: "VariantTaxForm",
  component: VariantTaxForm,
  hocs: [withVariantForm],
  priority: 30
});

registerBlock({
  region: "VariantDetailMain",
  name: "VariantInventoryForm",
  component: VariantInventoryForm,
  hocs: [withVariantForm],
  priority: 30
});

registerBlock({
  region: "VariantDetailMain",
  name: "OptionTable",
  component: OptionTable,
  hocs: [withVariantForm],
  priority: 40
});
