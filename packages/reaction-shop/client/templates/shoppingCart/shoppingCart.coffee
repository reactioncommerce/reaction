Template.shopCartIcon.helpers
  cartCount: ->
    Cart.find({sessionId:Session.get('serverSession')._id}).count()

Template.shopCartIconList.helpers
  cartList: ->
    Cart.find()