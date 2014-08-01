Media = ReactionCore.Collections.Media

Template.productList.helpers
  products: ->
    getProductsByTag(@tag)

  media: (variant) ->
    # find first parent variant and default the image
    variants = (variant for variant in this.variants when not variant.parentId )
    if variants.length > 0
      variantId = variants[0]._id
      defaultImage = Media.findOne({'metadata.variantId':variantId, "metadata.priority": 0})

    if defaultImage
      return defaultImage
    else
      return false