import "./templates/productDetailSimple.html";
import "./templates/productDetailSimple.js";
import { registerComponent } from "/imports/plugins/core/layout/lib/components";

import {
  ProductField,
  ProductTags,
  ProductMetadata,
  PriceRange,
  AddToCartButton,
  ProductNotFound
} from "./components";

import {
  Divider
} from "/imports/plugins/core/ui/client/components";

import {
  SocialContainer,
  VariantListContainer
} from "./containers";

import {
  AlertContainer,
  MediaGalleryContainer
} from "/imports/plugins/core/ui/client/containers";


// Register PDP components and some others
registerComponent({
  name: "ProductField",
  component: ProductField
});

registerComponent({
  name: "ProductTags",
  component: ProductTags
});

registerComponent({
  name: "ProductMetadata",
  component: ProductMetadata
});

registerComponent({
  name: "PriceRange",
  component: PriceRange
});

registerComponent({
  name: "AlertContainer",
  component: AlertContainer
});

registerComponent({
  name: "MediaGalleryContainer",
  component: MediaGalleryContainer
});

registerComponent({
  name: "SocialContainer",
  component: SocialContainer
});

registerComponent({
  name: "VariantListContainer",
  component: VariantListContainer
});

registerComponent({
  name: "AddToCartButton",
  component: AddToCartButton
});

registerComponent({
  name: "Divider",
  component: Divider
});

registerComponent({
  name: "ProductNotFound",
  component: ProductNotFound
});
