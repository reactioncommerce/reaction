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
# confirm product deletion, delete, and alert
###
@maybeDeleteProduct = (prod) ->
  title = prod.title || "the product"
  id = prod._id
  if confirm("Delete this product?")
    Products.remove id, (error, result) ->
      if error or result < 1
        Alerts.add "There was an error deleting " + title, "danger", type: "prod-delete-" + id
        console.log "Error deleting product " + id, error
      else
        setCurrentProduct null
        Router.go "/"
        Alerts.add "Deleted " + title, "info", type: "prod-delete-" + id

###
#  Reactive current product
#  This ensures reactive products, without session
#  products:
#  set usage: currentProduct.set "productId",string
#  get usage: currentProduct.get "productId"
#  variants:
#  set usage: currentProduct.set "variantId",string
#  get usage: currentProduct.get "variantId"
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

@setCurrentVariant = (variantId) ->
  # If we are unsetting, just do it
  if variantId is null
    currentProduct.set "variantId", null
  return unless variantId
  # If not unsetting, get the current variant ID
  currentId = selectedVariantId()
  # If we're changing to a different current ID, do it.
  # Otherwise there is no need to set.
  return if currentId is variantId
  currentProduct.set "variantId", variantId
  return

@setCurrentProduct = (productId) ->
  # If we are unsetting, just do it
  if productId is null
    currentProduct.set "productId", null
  return unless productId
  # If not unsetting, get the current product ID
  currentId = selectedProductId()
  # If we're changing to a different current ID, do it.
  # Otherwise there is no need to set.
  return if currentId is productId
  currentProduct.set "productId", productId
  # Clear the current variant as well
  currentProduct.set "variantId", null
  return

@selectedVariant = ->
  id = selectedVariantId()
  return unless id
  product = selectedProduct()
  return unless product
  variant = _.findWhere product.variants, _id: id
  return variant

@selectedProduct = ->
  id = selectedProductId()
  product = Products.findOne id
  return product

@selectedProductId = ->
  return currentProduct.get "productId"

@selectedVariantId = ->
  id = currentProduct.get "variantId"
  return id if id?
  # default to top variant in selectedProduct
  product = selectedProduct()
  return unless product
  variants = (variant for variant in product.variants when not variant.parentId)
  return unless variants.length > 0
  id = variants[0]._id
  currentProduct.set "variantId", id
  return id