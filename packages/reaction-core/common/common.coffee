###
# Common settings for CollectionFS
###
FS.HTTP.setBaseUrl('/assets')

FS.HTTP.setHeadersForGet([
  ['Cache-Control', 'public, max-age=31536000']
])

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
    @deps[key] = new Deps.Dependency  unless @deps[key]

currentProduct = @currentProduct
