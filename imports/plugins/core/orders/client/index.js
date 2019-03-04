import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInbox } from "@fortawesome/free-solid-svg-icons";

import { registerOperatorRoute } from "/imports/client/ui";
import Orders from "./containers/orderDashboardContainer";
import OrderDetail from "./containers/orderDetailContainer";
import "./helpers";

import "./templates/list/pdf.html";
import "./templates/list/pdf.js";
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

registerOperatorRoute({
  path: "/orders/:_id",
  mainComponent: OrderDetail,
  isNavigationLink: false
});

registerOperatorRoute({
  isNavigationLink: true,
  isSetting: false,
  mainComponent: Orders,
  path: "/orders",
  // eslint-disable-next-line react/display-name
  SidebarIconComponent: (props) => <FontAwesomeIcon icon={faInbox} {...props} />,
  sidebarI18nLabel: "admin.dashboard.ordersLabel"
});

export { ProductImage } from "./components/productImage";
