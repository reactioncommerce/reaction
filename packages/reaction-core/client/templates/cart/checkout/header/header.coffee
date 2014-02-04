Template.checkoutHeader.helpers
  siteName: ->
    siteName = Shops.findOne()?.name
    siteName