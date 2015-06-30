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
    handle: getSlug product.title
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

  # keep quantity of parent variants in sync with the aggregate quantity of
  # of their children
  if modifier.$set?['variants.$']?.inventoryQuantity >= 0
    qty = modifier.$set['variants.$'].inventoryQuantity || 0
    for variant in product.variants when variant._id isnt modifier.$set['variants.$']._id and variant.parentId is modifier.$set['variants.$'].parentId
      qty += variant.inventoryQuantity || 0
    parentVariant = (variant for variant in product.variants when variant._id is modifier.$set['variants.$'].parentId)[0]
    if parentVariant?.inventoryQuantity isnt qty
      Products.direct.update({'_id': product._id, 'variants._id':modifier.$set['variants.$'].parentId }, {$set: {'variants.$.inventoryQuantity':qty } })
      
  # keep quantity of variants that contain 'inventory' in sync with the aggregate
  # quantity of their inventory children
  if modifier.$addToSet?['variants']?.type is 'inventory' or
  modifier.$addToSet?['variants']?.$each?[0].type is 'inventory'
    modVariants = modifier.$addToSet?.variants
    qtyAdded = modVariants.$each?.length || 1
    parentId = modVariants.parentId || modVariants.$each?[0].parentId
    # Feels like an ugly way to do aggregate, TODO: Review this?
    inventoryVariants = (variant for variant in product.variants when variant?.parentId is parentId and variant?.type == 'inventory')
    # The item we are about to add isn't counted yet, so account for that (+1 to count).
    qty = inventoryVariants.length + 1 || 1
    parentVariant = (variant for variant in product.variants when variant._id is parentId)[0]
    if parentVariant?.inventoryQuantity isnt qty
      Products.direct.update({'_id': product._id, 'variants._id':parentId }, {$set: {'variants.$.inventoryQuantity':qty } })

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

  if modifier.$addToSet?.variants
    modifier.$addToSet.variants.createdAt = new Date()  unless modifier.$addToSet.variants.createdAt
    modifier.$addToSet.variants.updatedAt = new Date()  unless modifier.$addToSet.variants.updatedAt
