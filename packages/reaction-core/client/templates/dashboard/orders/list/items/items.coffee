Template.ordersListItems.helpers
  media: ->
    # return default image for this product variant
    if defaultImage = ReactionCore.Collections.Media.findOne({'metadata.variantId': @variants._id})
      return defaultImage
    else
      # loop through all product variants attempting to find default image
      product = ReactionCore.Collections.Products.findOne @productId
      return unless product
      img = null
      _.any product.variants, (v) ->
        img = ReactionCore.Collections.Media.findOne({'metadata.variantId': v._id})
        return !!img
      return img
