import React from "react";
import InboxIcon from "mdi-material-ui/Inbox";
import { registerBlock } from "@reactioncommerce/reaction-components";
import { registerOperatorRoute } from "/imports/client/ui";
import ContentViewExtraWideLayout from "/imports/client/ui/layouts/ContentViewExtraWideLayout";
import OrderCardSummary from "./components/OrderCardSummary";
import Orders from "./containers/orderDashboardContainer";
import Order from "./containers/OrderContainer";
import "../lib/extendShopSchema";
import "./helpers";

// Print page layout
import "./templates/list/pdf.html";
import "./templates/list/pdf.js";


// Register order related routes

/*
 * Single order page route
 */
registerOperatorRoute({
  isNavigationLink: false,
  mainComponent: Order,
  path: "/orders/:_id"
});

/*
 * Orders table route
 */
registerOperatorRoute({
  isNavigationLink: true,
  isSetting: false,
  priority: 10,
  layoutComponent: ContentViewExtraWideLayout,
  mainComponent: Orders,
  path: "/orders",
  // eslint-disable-next-line react/display-name
  SidebarIconComponent: (props) => <InboxIcon {...props} />,
  sidebarI18nLabel: "admin.dashboard.ordersLabel"
});


// Register order related blocks

registerBlock({
  region: "OrderCardSummary",
  name: "OrderCardSummary",
  component: OrderCardSummary,
  priority: 10
});
