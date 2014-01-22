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

    # Submit for processing
    Meteor.Paypal.authorize form,
      total: Session.get "cartTotal"
      currency: "USD"
    , (error, transaction) ->
      if error
        console.log error.response.details[0].field
      else
        # Update Cart and clone to an order
        currentCartId = Cart.findOne()._id
        Cart.update currentCartId,
          $set:
            payment:[
              processor: "paypal"
              paymentMethod: transaction.payment.payer.payment_method
              transactionId: transaction.payment.id
              status: transaction.payment.state
              mode: transaction.payment.intent
              createdAt: new Date(transaction.payment.create_time)
              updatedAt: new Date(transaction.payment.update_time)
            ]
        ,
          validationContext: "Cart"
        , (error, result) ->
          if error
            console.log "error update payment method to cart"+error
          else
            Meteor.call "copyCartToOrder",Cart.findOne(), (error, result) ->
              if error
                console.log "copyCart "+error
              else
                $("#paypal-payment-form .btn").removeClass("spin").addClass("btn-info").text("Success! Order Completed")
                #clear cart related sessions
                delete Session.keys["billingUserAddressId"]
                delete Session.keys["shippingUserAddressId"]
                delete Session.keys["shippingMethod"]
                Session.set("shoppingCart","")

                Deps.flush()
                #go to order success
                Router.go "cartCompleted",
                  _id: result