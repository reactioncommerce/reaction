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

  if modifier.$set['variants.$']
    qty = 0;
    for variant in product.variants when variant._id isnt modifier.$set['variants.$']._id and variant.parentId is modifier.$set['variants.$'].parentId
      qty += variant.inventoryQuantity
    qty += modifier.$set['variants.$'].inventoryQuantity
    Products.direct.update({'_id': product._id, 'variants._id':modifier.$set['variants.$'].parentId }, {$set: {'variants.$.inventoryQuantity':qty } })

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
