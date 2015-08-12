###
# cartCheckout is a wrapper template
# controlling the load order of checkout step templates
###

###
# If you are looking for:
#  - cartWorkflow
#  - cartWorkflowPosition
#  - cartWorkflowCompleted
# see helpers/cart.coffee
###

Template.cartCheckout.helpers
  cart: ->
    return Cart.findOne()

Template.cartCheckout.onRendered ->
  # ensure checkout drawer does not display
  Session.set "displayCartDrawer", false
