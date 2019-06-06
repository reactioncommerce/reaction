import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInbox } from "@fortawesome/free-solid-svg-icons";
import { registerBlock } from "@reactioncommerce/reaction-components";
import { registerOperatorRoute } from "/imports/client/ui";
import ContentViewExtraWideLayout from "/imports/client/ui/layouts/ContentViewExtraWideLayout";
import OrderCardSummary from "./components/orderCardSummary";
import Orders from "./containers/orderDashboardContainer";
import OrderCard from "./containers/orderCardContainer";

// Print page layout
import "./templates/list/pdf.html";
import "./templates/list/pdf.js";


// To remove with orders-2.0
// To remove with orders-2.0
// To remove with orders-2.0
import "./helpers";
import "./templates/list/summary.html";
import "./templates/list/summary.js";
import "./templates/workflow/shippingTracking.html";
import "./templates/workflow/shippingTracking.js";
import "./templates/workflow/workflow.html";
import "./templates/workflow/workflow.js";
import "./templates/orders.html";
import "./templates/orders.js";
import "./containers/invoiceContainer";
import "./containers/orderSummaryContainer";
import "../lib/extendShopSchema";

export { ProductImage } from "./components/productImage";

import OrderDetail from "./containers/orderDetailContainer";

registerOperatorRoute({
  isNavigationLink: false,
  mainComponent: OrderDetail,
  path: "/orders-old/:_id"
});
// To remove with orders-2.0
// To remove with orders-2.0
// To remove with orders-2.0


// Register order related routes

/*
 * Single order page route
 */
registerOperatorRoute({
  isNavigationLink: false,
  mainComponent: OrderCard,
  path: "/orders/:_id"
});

/*
 * Orders table route
 */
registerOperatorRoute({
  isNavigationLink: true,
  isSetting: false,
  layoutComponent: ContentViewExtraWideLayout,
  mainComponent: Orders,
  path: "/orders",
  // eslint-disable-next-line react/display-name
  SidebarIconComponent: (props) => <FontAwesomeIcon icon={faInbox} {...props} />,
  sidebarI18nLabel: "admin.dashboard.ordersLabel"
});


// Register order related blocks

registerBlock({
  region: "OrderCardSummary",
  name: "OrderCardSummary",
  component: OrderCardSummary,
  priority: 10
});
