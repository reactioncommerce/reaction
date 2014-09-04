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

Products.after.update (userId, product, fieldNames, modifier, options) ->
  thisProduct = Products.findOne(product._id)
  parentVariants = (variant for variant in thisProduct.variants when not variant.parentId)
  if parentVariants
    for parentVariant in parentVariants
      childVariants = (variant for variant in product.variants when variant?.parentId is parentVariant._id )
      if childVariants.length > 0
        aggregateQuantity = 0
        for childVariant in childVariants
          aggregateQuantity = aggregateQuantity + childVariant.inventoryQuantity
        if aggregateQuantity
          sel = {"_id":product._id,"variants._id":parentVariant._id}
          console.log '1'
          Products.update(sel, {$set: {"variants.$": {_id: parentVariant._id, inventoryQuantity: aggregateQuantity}}}, {validate: false}, (error,result) ->
            console.log error if error
            return
          )

