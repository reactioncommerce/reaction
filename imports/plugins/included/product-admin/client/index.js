import "./templates/productAdmin.html";
import "./templates/productAdmin.js";
import "./blocks";

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBox } from "@fortawesome/free-solid-svg-icons";
import { registerOperatorRoute } from "/imports/client/ui";

import ProductTable from "./components/ProductTable";
import ProductDetailLayout from "./layouts/ProductDetail";
import VariantDetail from "./layouts/VariantDetail";
import ContentViewExtraWideLayout from "/imports/client/ui/layouts/ContentViewExtraWideLayout";

// HOCs
import withCreateProduct from "./hocs/withCreateProduct";
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
  layoutComponent: ContentViewExtraWideLayout,
  path: "/products",
  mainComponent: ProductTable,
  hocs: [withCreateProduct],
  // eslint-disable-next-line react/display-name, react/no-multi-comp
  SidebarIconComponent: (props) => <FontAwesomeIcon icon={faBox} {...props} />,
  sidebarI18nLabel: "admin.products"
});
