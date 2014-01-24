Template.cartCompleted.helpers
  orderStatus: () ->
    status = "placed" if this.status is "new"
  status