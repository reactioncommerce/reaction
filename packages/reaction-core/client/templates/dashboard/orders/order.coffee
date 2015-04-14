Template.order.events
	'click .save-order-pdf': () ->
    saveOrderAsPDF Orders.findOne(this._id)
    return
  'click .save-label-pdf': () ->
    #TODO: Add label printing capability
    return