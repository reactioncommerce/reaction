getCardType = (number) ->
  re = new RegExp("^4")
  return "visa"  if number.match(re)?
  re = new RegExp("^(34|37)")
  return "amex"  if number.match(re)?
  re = new RegExp("^5[1-5]")
  return "mastercard"  if number.match(re)?
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
        if transaction.saved is true #successful transaction
          # Format the transaction to store with order and submit to CartWorkflow
          paymentMethod =
              processor: "Paypal"
              storedCard: storedCard
              method: transaction.payment.payer.payment_method
              transactionId: transaction.payment.id
              status: transaction.payment.state
              mode: transaction.payment.intent
              createdAt: new Date(transaction.payment.create_time)
              updatedAt: new Date(transaction.payment.update_time)
          #update UI while we store the payment and order
          $("#paypal-payment-form .btn").removeClass("spin").addClass("btn-info").text("Success! Order Completed")
          # Store transaction information with order
          CartWorkflow.paymentMethod(paymentMethod)
          # CartWorkflow.paymentAuth() will create order, clear the cart, and update inventory, goto order confirmation page

        else # card errors are returned in transaction
          for errors in transaction.error.response.details
            formattedError = "Oops! " + errors.issue + ": " + errors.field.split(/[. ]+/).pop().replace(/_/g,' ')
            paymentAlert(formattedError)
