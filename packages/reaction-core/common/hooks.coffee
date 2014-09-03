applyVariantDefaults = (variant) ->
  _.defaults(variant,
    _id: Random.id()
    inventoryManagement: true
    inventoryPolicy: true
    updatedAt: new Date()
    createdAt: new Date()
  )

Products.before.insert (userId, product) ->
  product.shopId = product.shopId || ReactionCore.getCurrentShop()._id # avoid calling if present
  _.defaults(product,
    productType: "Simple"
    handle: _.slugify(product.title)
    isVisible: false
    updatedAt: new Date()
    createdAt: new Date()
  )
  for variant in product.variants
    applyVariantDefaults(variant)

Products.before.update (userId, product, fieldNames, modifier, options) ->
  #set default variants
  updatedAt: new Date()

  if modifier.$push
    if modifier.$push.variants
      applyVariantDefaults(modifier.$push.variants)

  unless _.indexOf(fieldNames, 'positions') is -1
    addToSet = modifier.$addToSet?.positions
    if addToSet
      createdAt = new Date()
      updatedAt = new Date()
      if addToSet.$each
        for position of addToSet.$each
          createdAt = new Date()
          updatedAt = new Date()
      else
        addToSet.updatedAt = updatedAt
  if modifier.$set then modifier.$set.updatedAt = new Date()
  # if modifier.$addToSet then modifier.$addToSet.updatedAt = new Date()

# Products.after.update (userId, product, fieldNames, modifier, options) ->
#   parentVariants = (variant for variant in product.variants when variant?.parentId is null )
#   for parentVariant in parentVariants
#     childVariants = (variant for variant in product.variants when variant?.parentId is parentVariant._id )
#     if childVariants
#       for childVariant in childVariants
