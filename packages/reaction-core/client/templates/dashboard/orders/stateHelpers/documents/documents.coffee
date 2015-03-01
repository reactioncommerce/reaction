Template.stateHelperDocuments.helpers
  documents: () ->
    # TODO: documents no longer stored in metadata
    # ReactionCore.Collections.FileStorage.find "metadata.orderId": @._id

Template.stateHelperDocuments.events
  'click .download-documents': () ->
    OrderWorkflow.shipmentPrepare @
    return
  'click .save-order-pdf': () ->
    saveOrderAsPDF Orders.findOne(this._id)
    return
