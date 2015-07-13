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
# On product update
###
Products.before.update (userId, product, fieldNames, modifier, options) ->
  #set default variants
  updatedAt: new Date()
  if modifier.$push
    if modifier.$push.variants
      applyVariantDefaults(modifier.$push.variants)

  # Keep Parent/Grandparent/etc data in sync as their child variants get updated
  #
  # Finds any modifier that:
  # sets the inventory quantity of variants,
  # adds one or more 'inventory' type to the product's set of variants,
  # or pulls a variant from the set.
  #
  if modifier.$set?['variants.$']?.inventoryQuantity >= 0 or
  modifier.$addToSet?.variants?.$each?[0].type is 'inventory' or
  modifier.$addToSet?.variants?.type is 'inventory' or
  modifier.$pull?.variants
  
    if modifier.$set?['variants.$']
      updatedVariantId = modifier.$set['variants.$']._id
      updatedVariant = modifier.$set['variants.$']
      updatedInventoryQuantity = modifier.$set['variants.$'].inventoryQuantity
      originalInventoryQuantity = (variant for variant in product.variants when variant._id is updatedVariantId)[0].inventoryQuantity
      differenceInQty = updatedInventoryQuantity - originalInventoryQuantity
      
    else if modifier.$pull?.variants
      removedVariantId = modifier.$pull['variants']._id
      removedVariant = (variant for variant in product.variants when variant._id is removedVariantId)[0]
      # If variant we pulled has a parent (is not the top level option)
      if removedVariant.parentId
        updatedVariantId = removedVariant.parentId
        updatedVariant = (variant for variant in product.variants when variant._id is updatedVariantId)[0]
        if removedVariant.inventoryQuantity
          differenceInQty = -removedVariant.inventoryQuantity
        else
          differenceInQty = -1
      
      else # variant is top level option, no need to cascade updates
        updatedVariant = null
        updatedVariantId = null
        differenceInQty = null
      
    else if modifier.$addToSet?.variants?.type is 'inventory'
      # Add single variant of type inventory to an existing parent
      # find by parentId
      updatedVariantId = modifier.$addToSet['variants'].parentId
      updatedVariant = (variant for variant in product.variants when variant._id is updatedVariantId)[0]
      differenceInQty = 1
      # Flag to let us know if this is the first inventory variant for this option
      firstInventoryVariant = (variant for variant in product.variants when variant._id is updatedVariantId and variant.type == 'inventory').length > 0
      
      if firstInventoryVariant
        differenceInQty = 1 - updatedVariant.inventoryQuantity
      
    else if modifier.$addToSet?.variants?.$each[0].type = 'inventory'
      # Add multiple variants of type inventory to an existing parent
      updatedVariantId = modifier.$addToSet['variants'].$each[0].parentId
      updatedVariant = (variant for variant in product.variants when variant._id is updatedVariantId)[0]
      differenceInQty = modifier.$addToSet['variants'].$each.length
      
      # Flag to let us know if this is the first inventory variant for this option
      firstInventoryVariant = (variant for variant in product.variants when variant._id is updatedVariantId and variant.type == 'inventory').length > 0
      
      # If this is the first inventory variant, we are replacing old qty with
      # new variant based inventoryQuantity.
      if firstInventoryVariant
        differenceInQty = differenceInQty - updatedVariant.inventoryQuantity
      
      
  
    loop
      break unless updatedVariantId # Check to make sure we have a variant to update
      updatedQty = updatedVariant.inventoryQuantity + differenceInQty
      Products.direct.update({'_id': product._id, 'variants._id': updatedVariantId}, {$set: {'variants.$.inventoryQuantity': updatedQty }})
      break unless updatedVariant.parentId # Break out of loop if top level variant
      updatedVariantId = updatedVariant.parentId
      updatedVariant = (variant for variant in product.variants when variant._id is updatedVariantId)[0]
    
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

  if modifier.$addToSet?.variants
    modifier.$addToSet.variants.createdAt = new Date()  unless modifier.$addToSet.variants.createdAt
    modifier.$addToSet.variants.updatedAt = new Date()  unless modifier.$addToSet.variants.updatedAt
