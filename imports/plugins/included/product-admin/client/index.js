import "./templates/productAdmin.html";
import "./templates/productAdmin.js";

export { default as ProductAdmin } from "./containers/productAdmin";


import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBox } from "@fortawesome/free-solid-svg-icons";
import { registerOperatorRoute } from "/imports/client/ui";

import ProductList from "./components/ProductList";
import ProductDetail from "./components/ProductDetail";
import ContentViewExtraWideLayout from "/imports/client/ui/layouts/ContentViewExtraWideLayout";


registerOperatorRoute({
  isNavigationLink: false,
  isSetting: false,
  path: "/products/:handle/:variantId?",
  mainComponent: ProductDetail
});

registerOperatorRoute({
  isNavigationLink: true,
  isSetting: false,
  layoutComponent: ContentViewExtraWideLayout,
  path: "/products",
  mainComponent: ProductList,
  // eslint-disable-next-line react/display-name, react/no-multi-comp
  SidebarIconComponent: (props) => <FontAwesomeIcon icon={faBox} {...props} />,
  sidebarI18nLabel: "admin.products.Products"
});
