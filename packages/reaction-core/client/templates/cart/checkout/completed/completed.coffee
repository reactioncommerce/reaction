Template.cartCompleted.helpers
  orderStatus: () ->
    status = this?.status || "processing"
    if status is "new" then status = "placed"
    return status