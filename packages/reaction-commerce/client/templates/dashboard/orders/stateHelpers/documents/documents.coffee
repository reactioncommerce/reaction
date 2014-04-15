Template.stateHelperDocuments.helpers
  documents: () ->
    FileStorage.find "metadata.orderId": @._id

Template.stateHelperDocuments.events
  'click .download-documents': () ->
    OrderWorkflow.shipmentPrepare @