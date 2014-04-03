Template.cartDrawerItems.rendered = ->
  $("#cart-drawer-carousel").data('owlCarousel')?.reinit()

Template.cartDrawerItems.helpers
  media: (variant) ->
    defaultImage = Media.findOne({'metadata.variantId': this.variants._id})
    if defaultImage
      return defaultImage
    else
      return false