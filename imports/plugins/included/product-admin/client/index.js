import "./templates/productAdmin.html";
import "./templates/productAdmin.js";
import "./blocks";

import React from "react";
import CubeIcon from "mdi-material-ui/Cube";
import { registerOperatorRoute } from "/imports/client/ui";

import ProductTable from "./components/ProductTable";
import ProductDetailLayout from "./layouts/ProductDetail";
import VariantDetail from "./layouts/VariantDetail";
import ContentViewExtraWideLayout from "/imports/client/ui/layouts/ContentViewExtraWideLayout";

// HOCs
import withProduct from "./hocs/withProduct";
import withVariant from "./hocs/withVariant";

// Register routes
registerOperatorRoute({
  isNavigationLink: false,
  isSetting: false,
  path: "/products/:handle/:parentVariantId/:variantId",
  mainComponent: VariantDetail,
  hocs: [
    withProduct,
    withVariant
  ]
});

registerOperatorRoute({
  isNavigationLink: false,
  isSetting: false,
  path: "/products/:handle/:variantId",
  mainComponent: VariantDetail,
  hocs: [
    withProduct,
    withVariant
  ]
});

registerOperatorRoute({
  isNavigationLink: false,
  isSetting: false,
  path: "/products/:handle",
  mainComponent: ProductDetailLayout,
  hocs: [withProduct]
});

registerOperatorRoute({
  isNavigationLink: true,
  isSetting: false,
  priority: 20,
  layoutComponent: ContentViewExtraWideLayout,
  path: "/products",
  mainComponent: ProductTable,
  // eslint-disable-next-line react/display-name, react/no-multi-comp
  SidebarIconComponent: (props) => <CubeIcon {...props} />,
  sidebarI18nLabel: "admin.products"
});
