/**
 * orders helpers
 *
 */

Template.orders.helpers({
  settings: function () {
    ReactionCore.Subscriptions.Orders = Meteor.subscribe("Orders", Meteor.userId());
    return {
      collection: ReactionCore.Collections.Orders,
      rowsPerPage: 10,
      showFilter: false,
      showNavigation: true,
      fields: [
          { key: 'userId', label: 'User', tmpl: Template.orderDetail },
          { key: 'items', label: 'Items', tmpl: Template.ordersListItems},
          { key: 'workflow.status', label: 'Status', tmpl: Template.orderStatusDetail },
          { key: 'invoices', label: 'Summary', tmpl: Template.ordersListSummary}
      ]
    };
  },

  isOrder: function () {
    if (this._id) {
      return true;
    } else {
      return false;
    }
  }
});

Template.orders.events({
  'click .reactive-table tbody tr': function (event) {
    if (this.workflow.status === "new") {
      this.workflow.status = "coreShipmentTracking"
      /*Meteor.call("layout/workflow", "coreOrderWorkflow", "shipmentTracking");*/
    }
    ReactionCore.showActionView({
      label: "Order " + this._id ,
      data: this,
      template: this.workflow.status
    });

  }
});
