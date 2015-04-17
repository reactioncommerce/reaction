###
Uses the browser print function.
###

Template.completedPDFLayout.inheritsHelpersFrom "dashboardOrdersList"
Template.completedPDFLayout.inheritsEventsFrom "dashboardOrdersList"
Template.completedPDFLayout.helpers
  invoice: () ->
    return @.payment.invoices[0]
