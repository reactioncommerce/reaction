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

paymentAlert = (errorMessage) ->
  $(".alert").removeClass("hidden").text(errorMessage)
  $("#paypal-payment-form :input").attr("disabled", false)
  $("#paypal-payment-form #btn-complete-order").text("Resubmit payment ")
  $("#paypal-payment-form #btn-processing").addClass("hidden")

Template.paypalPaymentForm.helpers
  PaypalPaymentSchema : () ->
    new AutoForm(PaypalPaymentSchema)

  cartPayerName: ->
    Cart.findOne()?.payment?.address?.fullName

  monthOptions: () ->
    monthOptions =
      [
        { value: "", label: "Choose month"}
        { value: "01", label: "1 - January"}
        { value: "02", label: "2 - February" }
        { value: "03", label: "3 - March" }
        { value: "04", label: "4 - April" }
        { value: "05", label: "5 - May" }
        { value: "06", label: "6 - June" }
        { value: "07", label: "7 - July" }
        { value: "08", label: "8 - August" }
        { value: "09", label: "9 - September" }
        { value: "10", label: "10 - October" }
        { value: "11", label: "11 - November" }
        { value: "12", label: "12 - December" }
      ]
    monthOptions

  yearOptions: () ->
    yearOptions = [{ value: "", label: "Choose year" }]
    year = new Date().getFullYear()
    for x in [1...9] by 1
      yearOptions.push { value: year , label: year}
      year++
    yearOptions

Template.paypalPaymentForm.events
  "submit #paypal-payment-form": (event,template) ->
    event.preventDefault()
    #process form (pre validated by autoform)
    form = {}
    $.each $("#paypal-payment-form").serializeArray(), ->
      form[@name] = @value
    #format for paypal
    form.first_name = form.payerName.split(" ")[0]
    form.last_name = form.payerName.split(" ")[1]
    form.number = form.cardNumber
    form.expire_month = form.expireMonth
    form.expire_year = form.expireYear
    form.cvv2 = form.cvv
    form.type = getCardType(form.cardNumber)
    # Order Layout
    $(".list-group a").css("text-decoration", "none")
    $(".list-group-item").removeClass("list-group-item")
    #Processing
    $("#paypal-payment-form :input").attr("disabled", true)
    $("#paypal-payment-form #btn-complete-order").text("Submitting ")
    $("#paypal-payment-form #btn-processing").removeClass("hidden")
    # Reaction only stores type and 4 digits
    storedCard = form.type.charAt(0).toUpperCase() + form.type.slice(1)+ " "+ form.cardNumber.slice(-4)
    # Submit for processing
    Meteor.Paypal.authorize form,
      total: Session.get "cartTotal"
      currency: "USD"
    , (error, transaction) ->
      if error
        # this only catches connection/authentication errors
        for errors in error.response.details
          formattedError = "Oops! " + errors.issue + ": " + errors.field.split(/[. ]+/).pop().replace(/_/g,' ')
          paymentAlert(formattedError)
      else
        # card errors are returned in transaction
        if transaction.saved is true
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
        else
          for errors in transaction.error.response.details
            formattedError = "Oops! " + errors.issue + ": " + errors.field.split(/[. ]+/).pop().replace(/_/g,' ')
            paymentAlert(formattedError)
