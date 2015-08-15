
Template.checkoutReview.onRendered ->
  # Call this step done, and move on to the next
  Meteor.call("cart/setStatus", 'checkoutReview')
