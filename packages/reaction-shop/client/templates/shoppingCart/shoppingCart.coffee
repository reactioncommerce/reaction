Template.shopCartIcon.helpers
  cartCount: ->
    if Session.get('serverSession')
      Cart.find({sessionId:Session.get('serverSession')._id}).count()

Template.shopCartIconList.helpers
  cartList: ->
    Cart.find()