Template.paypalPaymentForm.events
  "submit #paypal-payment-form": (event,template) ->
    event.preventDefault()
    #process form
    #TODO: validation of fields before submitting
    form = {}
    $.each $("#paypal-payment-form").serializeArray(), ->
      form[@name] = @value


    # Order Layout
    $(".list-group a").css("text-decoration", "none")
    $(".list-group-item").removeClass("list-group-item")

    #Processing
    $("#paypal-payment-form :input").attr("disabled", true)
    $("#paypal-payment-form #btn-complete-order").text("Submitting ")
    $("#paypal-payment-form #btn-processing").removeClass("hidden")

    getCardType = (number) ->
      re = new RegExp("^4")
      return "visa"  if number.match(re)?
      re = new RegExp("^(34|37)")
      return "amex"  if number.match(re)?
      re = new RegExp("^5[1-5]")
      return "masterCard"  if number.match(re)?
      re = new RegExp("^6011")
      return "discover"  if number.match(re)?
      ""
    form["type"] = getCardType form.number
    storedCard = form.type.charAt(0).toUpperCase() + form.type.slice(1)+ " "+ form.number.slice(-4)
    # Submit for processing
    Meteor.Paypal.authorize form,
      total: Session.get "cartTotal"
      currency: "USD"
    , (error, transaction) ->
      if error
        console.log error.response.details[0].field
      else
        # Update Cart and clone to an order
       paymentMethod =
            processor: "Paypal"
            storedCard: storedCard
            method: transaction.payment.payer.payment_method
            transactionId: transaction.payment.id
            status: transaction.payment.state
            mode: transaction.payment.intent
            createdAt: new Date(transaction.payment.create_time)
            updatedAt: new Date(transaction.payment.update_time)

        Cart.update Cart.findOne()._id,
          {$set:{"payment.paymentMethod":[paymentMethod]}}
          , (error, result) ->
            if error
              console.log "error update payment method to cart"+error
              console.log Cart.simpleSchema().namedContext().invalidKeys()
            else
              Meteor.call "copyCartToOrder",Cart.findOne(), (error, result) ->
                if error
                  console.log "An error occurred saving the order. : "+error
                else
                  $("#paypal-payment-form .btn").removeClass("spin").addClass("btn-info").text("Success! Order Completed")
                  #go to order success
                  Router.go "cartCompleted",
                    _id: result
                  #clear cart related sessions
                  delete Session.keys["billingUserAddressId"]
                  delete Session.keys["shippingUserAddressId"]
                  delete Session.keys["shippingMethod"]
                  Deps.flush()