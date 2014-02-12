Template.checkoutShipping.helpers
  rates: () ->
    rates = []
    config = ConfigData.findOne().shipping
    for carrier,value in config
      for method,index in carrier.methods
        if method?.rate?
          method.rate = "Free" if method.rate is '0'
          rates.push carrier: value, method: index, label:method.label, value:method.rate
        else #fetch rates
          console.log "Fetching"
    rates

   isSelected: (carrier,method)->
    currentShipping = Cart.findOne()?.shipping?.shippingMethod
    if (currentShipping?.carrier is this.carrier) and (currentShipping?.method is this.method)
      Session.set "shippingMethod",this
      return "active"

Template.checkoutShipping.events
  'click .list-group-item': (event) ->
    $('.checkout-shipping .active').removeClass('active')
    $(event.currentTarget).addClass('active')
    CartWorkflow.shipmentMethod(@)
    Session.set "shippingMethod",@
