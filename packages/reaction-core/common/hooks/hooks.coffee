#
# helper applied to variant on
# product update/insert
#
applyVariantDefaults = (variant) ->
  _.defaults(variant,
    _id: Random.id()
    inventoryManagement: true
    inventoryPolicy: true
    updatedAt: new Date()
    createdAt: new Date()
  )

###
# Collection Hooks
# See: https://github.com/matb33/meteor-collection-hooks
###

#
# create unpublished product
#
Products.before.insert (userId, product) ->
  product.shopId = product.shopId || ReactionCore.getShopId() # avoid calling if present
  _.defaults(product,
    productType: "Simple"
    handle: getSlug product.title
    isVisible: false
    updatedAt: new Date()
    createdAt: new Date()
  )
  for variant in product.variants
    applyVariantDefaults(variant)

###
# on product update
#
# Keep track of inventory for products and variants as their child variants get updated.
###
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
  # quantity of their inventory children when inventory variants are added
  if modifier.$addToSet?['variants']?.type is 'inventory' or
  modifier.$addToSet?['variants']?.$each?[0].type is 'inventory'
    modVariants = modifier.$addToSet?.variants
    qtyAdded = modVariants.$each?.length || 1
    parentId = modVariants.parentId || modVariants.$each?[0].parentId
    # Feels like an ugly way to aggregate, TODO: Review this?
    inventoryVariants = (variant for variant in product.variants when variant.parentId is parentId and variant.type == 'inventory')
    # The item we are about to add isn't counted yet, so account for that (+1 to count).
    qty = inventoryVariants.length + qtyAdded || 1
    parentVariant = (variant for variant in product.variants when variant._id is parentId)[0]
    if parentVariant?.inventoryQuantity isnt qty
      Products.direct.update({'_id': product._id, 'variants._id': parentId }, {$set: {'variants.$.inventoryQuantity':qty } })
    
    if parentVariant.parentId # Update Grandparent Inventory if it exists
      grandparent = (variant for variant in product.variants when variant._id is parentVariant.parentId)[0]
      if grandparent
        grandparentInventoryQty = grandparent?.inventoryQuantity + qtyAdded
        Products.direct.update({'_id': product._id, 'variants._id': grandparent._id}, {$set: {'variants.$.inventoryQuantity': grandparentInventoryQty }})
      
  # Update inventory for parent variants when child variants are removed.
  if modifier.$pull?['variants']
    modVariants = modifier.$pull.variants
    productId = modVariants._id
    variant = (variant for variant in product.variants when variant._id is productId)[0]
    
    parentId = variant?.parentId || null
    parentVariant = (variant for variant in product.variants when variant._id is parentId)[0]
    qty = (variant for variant in product.variants when variant.parentId is parentId).length - 1
    if parentVariant?.inventoryQuantity isnt qty
      Products.direct.update({'_id': product._id, 'variants._id': parentId}, {$set: {'variants.$.inventoryQuantity': qty }})
    
    if parentVariant?.parentId # Update Grandparent Inventory if it exists
      grandparent = (variant for variant in product.variants when variant._id is parentVariant.parentId)[0]
      if grandparent
        grandparentInventoryQty = grandparent?.inventoryQuantity - 1
        Products.direct.update({'_id': product._id, 'variants._id': grandparent._id}, {$set: {'variants.$.inventoryQuantity': grandparentInventoryQty }})
    
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
