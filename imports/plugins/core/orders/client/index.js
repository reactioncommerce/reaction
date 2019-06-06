import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInbox } from "@fortawesome/free-solid-svg-icons";
import { registerBlock } from "@reactioncommerce/reaction-components";
import { registerOperatorRoute } from "/imports/client/ui";
import ContentViewExtraWideLayout from "/imports/client/ui/layouts/ContentViewExtraWideLayout";
import Orders from "./containers/orderDashboardContainer";
import OrderCard from "/imports/plugins/core/orders/client/containers/orderCardContainer";
import OrderCardSummary from "/imports/plugins/core/orders/client/components/orderCardSummary";

// Print page layout
import "./templates/list/pdf.html";
import "./templates/list/pdf.js";


// Register order related routes

/*
 * Single order page route
 * GraphQL style
 */
registerOperatorRoute({
  path: "/orders-2.0/:_id",
  mainComponent: OrderCard,
  isNavigationLink: false
});

/*
 * Register route for /orders,
 * which renders the Orders table as the main component
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
  region: "OrderCard",
  name: "OrderCardSummary", // Block name
  component: OrderCardSummary,
  priority: 15
});


// To remove with orders-2.0
// To remove with orders-2.0
// To remove with orders-2.0

import OrderDetail from "./containers/orderDetailContainer";
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

/*
 * Single order page route
 * ** Meteor style - remove once GraphQL style is completed
 */
registerOperatorRoute({
  isNavigationLink: false,
  mainComponent: OrderDetail,
  path: "/orders/:_id"
});

export { ProductImage } from "./components/productImage";

// To remove with orders-2.0
// To remove with orders-2.0
// To remove with orders-2.0
