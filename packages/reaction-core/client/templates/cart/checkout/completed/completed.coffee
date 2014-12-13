Template.cartCompleted.helpers
  orderStatus: () ->
    status = "placed" if this.status is "new"

Template.cartCompleted.events
  'click .save-order-details': (event, template) ->
    saveOrderAsPDF template.data
    return
