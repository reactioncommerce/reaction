Template.loginInline.events
  'click .continue-guest': (event, template) ->
    event.preventDefault()
    Meteor.call("cart/setStatus", 'checkoutLogin')
