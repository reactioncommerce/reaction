Template.cartCheckoutHeader.helpers
  siteName: ->
    siteName = Shops.findOne().name
    siteName