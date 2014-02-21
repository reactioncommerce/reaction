Template.packingSlip.events
  'click .order-print-packing-invoice': (event, template) ->
    orderId = @._id
    path = Router.routes['cartCompleted'].path({_id: orderId})
    Meteor.call "createPDF", path, (err,result) ->
      Meteor.call "updateHistory",  orderId, "Packing Slip Generated", result