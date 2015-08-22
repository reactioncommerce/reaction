/**
* stateHelperDocuments helpers and events
*
*/
  Template.stateHelperDocuments.helpers({
    documents: function() {}
  });

  Template.stateHelperDocuments.events({
    'click .download-documents': function() {
      OrderWorkflow.shipmentPrepare(this);
    }
  });
