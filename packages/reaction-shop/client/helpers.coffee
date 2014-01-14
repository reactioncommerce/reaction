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
Handlebars.registerHelper "getVariantImage", (variant) ->
  variant = (currentProduct.get "variant") unless variant?._id
  if variant?._id
    try
      media = variant.medias[0].src
    catch err
      console.log "No media found! Returning default."
      if this.variants[0]?.medias?.src
        media = this.variants[0].medias[0].src
      else
        media = "../../resources/placeholder.jpeg"
    finally
      media
  else
    console.log "Variant image error: No object passed"