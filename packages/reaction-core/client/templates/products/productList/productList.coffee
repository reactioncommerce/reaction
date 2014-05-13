Template.productList.helpers
  products: ->
    getProductsByTag(@tag)

  media: (variant) ->
    variantId = this.variants[0]._id
    defaultImage = Media.findOne({'metadata.variantId':variantId})
    if defaultImage
      return defaultImage
    else
      return false