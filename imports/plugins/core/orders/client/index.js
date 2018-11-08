import Inbox from "@material-ui/icons/Inbox";

import { registerOperatorRoute } from "/imports/client/ui";
import Orders from "./containers/orderDashboardContainer";
import OrderDetail from "./containers/orderDetailContainer";
import "./helpers";

import "./templates/list/pdf.html";
import "./templates/list/pdf.js";
import "./templates/list/summary.html";
import "./templates/list/summary.js";


import "./templates/workflow/shippingInvoice.html";
import "./templates/workflow/shippingInvoice.js";
import "./templates/workflow/shippingSummary.html";
import "./templates/workflow/shippingSummary.js";
import "./templates/workflow/shippingTracking.html";
import "./templates/workflow/shippingTracking.js";
import "./templates/workflow/workflow.html";
import "./templates/workflow/workflow.js";

import "./templates/orders.html";
import "./templates/orders.js";

registerOperatorRoute({
  path: "/orders/:_id",
  mainComponent: OrderDetail,
  isNavigationLink: false
});

registerOperatorRoute({
  path: "/orders",
  mainComponent: Orders,
  isNavigationLink: true,
  sidebarIconComponent: Inbox,
  sidebarI18nLabel: "admin.dashboard.ordersLabel"
});

export { ProductImage } from "./components/productImage";
