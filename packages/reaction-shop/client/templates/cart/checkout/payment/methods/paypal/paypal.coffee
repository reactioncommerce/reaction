Template.paypalPaymentForm.events
  "submit #paypal-payment-form": (event,template) ->
    event.preventDefault()
    console.log template
    console.log  Template.paypalMethodForm.data()

    #Probably a good idea to disable the submit button here to prevent multiple submissions.
    # Meteor.Paypal.purchase card_data,
    #   total: "100.50"
    #   currency: "USD"
    # , (err, results) ->
    #   if err
    #     console.error err
    #   else
    #     console.log results

