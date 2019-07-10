import mutations from "./mutations";
import queries from "./queries";
import resolvers from "./resolvers";
import schemas from "./schemas";
import startup from "./startup";
import getDataForOrderEmail from "./util/getDataForOrderEmail";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionNodeApp} app The ReactionNodeApp instance
 * @return {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Orders",
    name: "reaction-orders",
    icon: "fa fa-sun-o",
    collections: {
      Orders: {
        name: "Orders",
        indexes: [
          // Create indexes. We set specific names for backwards compatibility
          // with indexes created by the aldeed:schema-index Meteor package.
          [{ accountId: 1, shopId: 1 }],
          [{ createdAt: -1 }, { name: "c2_createdAt" }],
          [{ email: 1 }, { name: "c2_email" }],
          [{ referenceId: 1 }, { unique: true }],
          [{ shopId: 1 }, { name: "c2_shopId" }],
          [{ "shipping.items.productId": 1 }],
          [{ "shipping.items.variantId": 1 }],
          [{ "workflow.status": 1 }, { name: "c2_workflow.status" }]
        ]
      }
    },
    functionsByType: {
      getDataForOrderEmail: [getDataForOrderEmail],
      startup: [startup]
    },
    graphQL: {
      resolvers,
      schemas
    },
    mutations,
    queries,
    settings: {
      name: "Orders"
    },
    registry: [{
      route: "/dashboard/orders",
      provides: ["dashboard"],
      workflow: "coreOrderWorkflow",
      name: "orders",
      label: "Orders",
      description: "Fulfill your orders",
      icon: "fa fa-sun-o",
      priority: 0,
      container: "core",
      template: "orders"
    }, {
      route: "/dashboard/orders",
      name: "dashboard/orders",
      provides: ["shortcut"],
      label: "Orders",
      description: "Fulfill your orders",
      icon: "fa fa-sun-o",
      priority: 1,
      container: "dashboard",
      template: "orders",
      audience: ["seller"]
    }, {
      route: "/dashboard/pdf/orders/:id",
      workflow: "coreOrderPrintWorkflow",
      layout: "printLayout",
      name: "dashboard/pdf/orders",
      template: "completedPDFLayout"
    }, {
      route: "order/fulfillment",
      label: "Order Fulfillment",
      permission: "orderFulfillment",
      name: "order/fulfillment"
    },
    {
      route: "order/view",
      label: "Order View",
      permission: "orderView",
      name: "order/view"
    }],
    layout: [{
      layout: "coreLayout",
      workflow: "coreOrderWorkflow",
      collection: "Orders",
      theme: "default",
      enabled: true,
      structure: {
        template: "orders",
        layoutHeader: "NavBar",
        layoutFooter: "Footer",
        notFound: "notFound",
        dashboardHeader: "dashboardHeader",
        dashboardHeaderControls: "orderListFilters",
        dashboardControls: "dashboardControls",
        adminControlsFooter: "adminControlsFooter"
      }
    }, {
      layout: "printLayout",
      workflow: "coreOrderPrintWorkflow",
      collection: "Orders",
      enabled: true,
      structure: {
        template: "completedPDFLayout",
        layoutHeader: "NavBar",
        layoutFooter: "Footer"
      }
    }, {
      layout: "coreLayout",
      workflow: "coreOrderShipmentWorkflow",
      collection: "Orders",
      theme: "default",
      enabled: true
    }, {
      label: "Order Processing",
      status: "created",
      workflow: "coreOrderWorkflow",
      audience: ["dashboard/orders"]
    }, {
      template: "coreOrderProcessing",
      label: "Order Processing",
      status: "processing",
      workflow: "coreOrderWorkflow",
      audience: ["dashboard/orders"]
    }, {
      template: "coreOrderCompleted",
      label: "Order Completed",
      status: "completed",
      workflow: "coreOrderWorkflow",
      audience: ["dashboard/orders"]
    }, { // Standard Order Fulfillment with shipping
      template: "OrderSummary",
      label: "Summary",
      workflow: "coreOrderShipmentWorkflow",
      audience: ["dashboard/orders"]
    }, {
      template: "OrderInvoice",
      label: "Invoice",
      workflow: "coreOrderShipmentWorkflow",
      audience: ["dashboard/orders"]
    }, {
      template: "coreOrderShippingTracking",
      label: "Shipment Tracking",
      workflow: "coreOrderShipmentWorkflow",
      audience: ["dashboard/orders"]
    }, { // Standard Order Item workflow
      label: "Inventory Adjust",
      workflow: "coreOrderItemWorkflow",
      status: "inventoryAdjusted",
      audience: ["dashboard/orders"]
    }, {
      label: "Item Payment Captured",
      workflow: "coreOrderItemWorkflow",
      status: "captured",
      audience: ["dashboard/orders"]
    }, {
      label: "Item Ship",
      workflow: "coreOrderItemWorkflow",
      status: "shipped",
      audience: ["dashboard/orders"]
    }, {
      label: "Item Delivered",
      workflow: "coreOrderItemWorkflow",
      status: "completed",
      audience: ["dashboard/orders"]
    }]
  });
}
