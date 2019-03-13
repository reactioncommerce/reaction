import "./templates/productAdmin.html";
import "./templates/productAdmin.js";

export { default as ProductAdmin } from "./containers/productAdmin";
export { ProductAdmin as ProductAdminForm } from "./components";

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBox } from "@fortawesome/free-solid-svg-icons";
import { registerOperatorRoute } from "/imports/client/ui";

import ProductTable from "./components/ProductTable";
import ProductDetail from "./components/ProductDetail";
import VariantDetail from "./components/VariantDetail";
import ContentViewExtraWideLayout from "/imports/client/ui/layouts/ContentViewExtraWideLayout";
import "./components"; // To register the components that need to be

registerOperatorRoute({
  isNavigationLink: false,
  isSetting: false,
  path: "/products/:handle/:variantId/:optionId",
  mainComponent: VariantDetail
});

registerOperatorRoute({
  isNavigationLink: false,
  isSetting: false,
  path: "/products/:handle/:variantId",
  mainComponent: VariantDetail
});

registerOperatorRoute({
  isNavigationLink: false,
  isSetting: false,
  path: "/products/:handle",
  mainComponent: ProductDetail
});

registerOperatorRoute({
  isNavigationLink: true,
  isSetting: false,
  layoutComponent: ContentViewExtraWideLayout,
  path: "/products",
  mainComponent: ProductTable,
  // eslint-disable-next-line react/display-name, react/no-multi-comp
  SidebarIconComponent: (props) => <FontAwesomeIcon icon={faBox} {...props} />,
  sidebarI18nLabel: "admin.products"
});
