Meteor.subscribe 'staff'
Meteor.subscribe 'products'
Meteor.subscribe 'orders'
Meteor.subscribe 'customers'
Meteor.subscribe 'tags'
Meteor.subscribe 'SystemConfig'

Deps.autorun ->
  if Session.get('serverSession')
    Meteor.subscribe 'cart', Session.get('serverSession')._id
    userId = Meteor.userId()
    sessionId = Session.get("serverSession")._id
    # Check for, create cart
    Meteor.call "createCart", sessionId, userId, (err, cart) ->
      # Insert new item, update quantity for existing
      Session.set('shoppingCart', Cart.findOne())