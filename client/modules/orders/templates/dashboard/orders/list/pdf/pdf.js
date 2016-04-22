/**
* completedPDFLayout
* inheritsHelpersFrom dashboardOrdersList
* Uses the browser print function.
*/
Template.completedPDFLayout.inheritsHelpersFrom("dashboardOrdersList");

Template.completedPDFLayout.inheritsEventsFrom("dashboardOrdersList");

Template.completedPDFLayout.helpers({
  invoice: function () {
    return this.billing[0].invoices;
  }
});
