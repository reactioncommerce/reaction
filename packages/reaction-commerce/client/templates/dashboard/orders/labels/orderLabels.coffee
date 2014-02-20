Template.packingSlip.events
  'click .order-print-packing-invoice': (event, template) ->
    path = Router.routes['cartCompleted'].path({_id: @._id})
    Meteor.call "createPDF", path, (err,result) ->
      console.log result