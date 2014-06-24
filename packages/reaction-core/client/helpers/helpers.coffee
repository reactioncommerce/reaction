###
# quick and easy snippet for toggling sessions
###
@toggleSession = (session_variable) ->
  if Session.get(session_variable)
    Session.set session_variable, false
  else
    Session.set session_variable, true
  return

###
# method to return tag specific product
###
@getProductsByTag = (tag) ->
  selector = {}
  if tag
    hashtags = []
    relatedTags = [tag]
    while relatedTags.length
      newRelatedTags = []
      for relatedTag in relatedTags
        if hashtags.indexOf(relatedTag._id) == -1
          hashtags.push(relatedTag._id)
          if relatedTag.relatedTagIds?.length
            newRelatedTags = _.union(newRelatedTags, Tags.find({_id: {$in: relatedTag.relatedTagIds}}).fetch())
      relatedTags = newRelatedTags
    selector.hashtags = {$in: hashtags}
  cursor = Products.find(selector)

###
#  Reactive current product
#  This ensures reactive products, without session
#  products:
#  set usage: currentProduct.set "product",object
#  get usage: currentProduct.get "product"
#  variants:
#  set usage: currentProduct.set "variant",object
#  get usage: currentProduct.get "variant"
###
@currentProduct =
  keys: {}
  deps: {}
  equals: (key) ->
    @keys[key]
  get: (key) ->
    @ensureDeps key
    @deps[key].depend()
    @keys[key]
  set: (key, value) ->
    @ensureDeps key
    @keys[key] = value
    @deps[key].changed()
  changed: (key) ->
    @ensureDeps key
    @deps[key].changed()
  ensureDeps: (key) ->
    @deps[key] = new Deps.Dependency unless @deps[key]

currentProduct = @currentProduct
