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
    CartWorkflow.shipmentMethod()
    rates

   isSelected: (carrier,method)->
    currentShipping = Cart.findOne()?.shipping?.shipmentMethod
    if (currentShipping?.carrier is this.carrier) and (currentShipping?.method is this.method)
      console.log "here"
      Session.set "shipmentMethod",this
      return "active"

Template.checkoutShipping.events
  'click .list-group-item': (event) ->
    $('.checkout-shipping .active').removeClass('active')
    $(event.currentTarget).addClass('active')
    CartWorkflow.shipmentMethod(@)
    Session.set "shipmentMethod",@
