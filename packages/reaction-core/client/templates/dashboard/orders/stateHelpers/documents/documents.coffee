Template.stateHelperDocuments.helpers
  documents: () ->
    ReactionCore.Collections.FileStorage.find "metadata.orderId": @._id

Template.stateHelperDocuments.events
  'click .download-documents': () ->
    OrderWorkflow.shipmentPrepare @