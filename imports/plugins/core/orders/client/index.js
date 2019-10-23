import React from "react";
import InboxIcon from "mdi-material-ui/Inbox";
import { registerBlock } from "@reactioncommerce/reaction-components";
import { registerOperatorRoute } from "/imports/client/ui";
import ContentViewExtraWideLayout from "/imports/client/ui/layouts/ContentViewExtraWideLayout";
import { Shop } from "/imports/collections/schemas";
import OrderCardSummary from "./components/OrderCardSummary";
import Orders from "./components/OrdersTable";
import Order from "./containers/OrderContainer";
import OrderPrint from "./containers/OrderPrintContainer";
import "./helpers";

Shop.extend({
  orderStatusLabels: {
    type: Object,
    blackbox: true,
    optional: true
  }
});

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
 * Single order print layout route
 */
registerOperatorRoute({
  isNavigationLink: false,
  mainComponent: OrderPrint,
  path: "/orders/print/:_id"
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
/*
 * OrderCardSummary
 */
registerBlock({
  region: "OrderCardSummary",
  name: "OrderCardSummary",
  component: OrderCardSummary,
  priority: 10
});
