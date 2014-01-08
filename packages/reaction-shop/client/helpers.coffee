# *****************************************************
# Methods for the reaction permissions
# https://github.com/ongoworks/reaction#rolespermissions-system
# *****************************************************
Handlebars.registerHelper "hasShopPermission", (permissions) ->
  Meteor.app.hasPermission(permissions)

Handlebars.registerHelper "hasOwnerAccess", ->
  Meteor.app.hasOwnerAccess()

# *****************************************************
# method to return tag specific product
# *****************************************************
@getProductsByTag = (tag) ->
  selector = {}
  if tag
    tagIds = []
    relatedTags = [tag]
    while relatedTags.length
      newRelatedTags = []
      for relatedTag in relatedTags
        if tagIds.indexOf(relatedTag._id) == -1
          tagIds.push(relatedTag._id)
          if relatedTag.relatedTagIds?.length
            newRelatedTags = _.union(newRelatedTags, Tags.find({_id: {$in: relatedTag.relatedTagIds}}).fetch())
      relatedTags = newRelatedTags
    selector.tagIds = {$in: tagIds}
  cursor = Products.find(selector)

# *****************************************************
# method to alway return an image,
# or a placeholder for a product variant
# *****************************************************
@getVariantImage = (variantId) ->
  if variantId
    variantProduct = Products.findOne({"variants._id":variantId},{fields:{"variants":true}})
    if variantProduct
      try
        media = _.filter(variantProduct.variants, (item)-> item._id is variantId)[0].medias[0].src
      catch err
        return "../../resources/placeholder.jpeg"
      media
    else
      console.log "Error with variant product"
      return "../../resources/placeholder.jpeg"
  else
    console.log "Error retrieving variant image"
