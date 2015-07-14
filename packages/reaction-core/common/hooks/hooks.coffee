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

#
# helper that gives us a few organized objects of child variants organized
# by parentId.
# returns an object that contains the following
#   children: object with arrays of all children for each parent
#   variantChildren: object with arrays of all children that are not type 'inventory' for each parent
#   inventoryChildren: object arrays of all children that are type inventory for each parent

organizedChildVariants = (product) ->
  children = {}
  inventoryChildren = {}
  variantChildren = {}
  variantCount = product.variants.length
  currentVariant = product.variants[0]
  i = 0
  while i < product.variants.length
    currentVariant = product.variants[i]
    # If currentVariant's parentId matches variant._id, it's a child
    if currentVariant.parentId
      if !children[currentVariant.parentId]
        children[currentVariant.parentId] = []
      children[currentVariant.parentId].push currentVariant
      # if currentVariant's type is 'inventory' it's an inventory variant
      # Otherwise it's a standard variant that could have children of it's own.
      if currentVariant.type == 'inventory'
        if !inventoryChildren[currentVariant.parentId]
          inventoryChildren[currentVariant.parentId] = []
        inventoryChildren[currentVariant.parentId].push currentVariant
      else
        if !variantChildren[currentVariant.parentId]
          variantChildren[currentVariant.parentId] = []
        variantChildren[currentVariant.parentId].push currentVariant
    i++
  {
    children: children
    variantChildren: variantChildren
    inventoryChildren: inventoryChildren
  }
  
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
  modifier.$pull?.variants?._id
  
    organizedChildren = organizedChildVariants(product)
    
    if modifier.$set?['variants.$']
      updatedVariantId = modifier.$set['variants.$']._id
      updatedVariant = modifier.$set['variants.$']
      updatedInventoryQuantity = modifier.$set['variants.$'].inventoryQuantity
      originalInventoryQuantity = (variant for variant in product.variants when variant._id is updatedVariantId)[0].inventoryQuantity || 0
      differenceInQty = updatedInventoryQuantity - originalInventoryQuantity
      
    else if modifier.$pull?.variants?._id
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
        updatedVariant = {parentId: null}
        updatedVariantId = null
        differenceInQty = null
      
    else if modifier.$addToSet?.variants?.type is 'inventory'
      # Add single variant of type inventory to an existing parent
      # find by parentId
      updatedVariantId = modifier.$addToSet['variants'].parentId
      updatedVariant = (variant for variant in product.variants when variant._id is updatedVariantId)[0]
      differenceInQty = 1
      # Flag to let us know if this is the first inventory variant for this option
      firstInventoryVariant = (variant for variant in product.variants when variant.parentId is updatedVariantId and variant.type == 'inventory').length is 0
      
      if firstInventoryVariant
        differenceInQty = 1 - updatedVariant.inventoryQuantity
      
    else if modifier.$addToSet?.variants?.$each[0].type = 'inventory'
      # Add multiple variants of type inventory to an existing parent
      updatedVariantId = modifier.$addToSet['variants'].$each[0].parentId
      updatedVariant = (variant for variant in product.variants when variant._id is updatedVariantId)[0]
      differenceInQty = modifier.$addToSet['variants'].$each.length
      
      # Flag to let us know if this is the first inventory variant for this option
      firstInventoryVariant = (variant for variant in product.variants when variant.parentId is updatedVariantId and variant.type == 'inventory').length is 0
      
      # If this is the first inventory variant, we are replacing old qty with
      # new variant based inventoryQuantity.
      if firstInventoryVariant and updatedVariant.inventoryQuantity
        differenceInQty = differenceInQty - updatedVariant.inventoryQuantity
      
      
    ## Loop through all variants in the ancestor chain for the variant that
    ## we are updating and update the inventory quantity for each one
    loop
      break unless updatedVariantId # Check to make sure we have a variant to update
      runningQty = 0
      
      # If the current `updatedVariant` has children with type `'variant'`
      # add up the totals of all of it's variant children
      if organizedChildren.variantChildren[updatedVariantId]?.constructor is Array
        runningQty += organizedChildren.variantChildren[updatedVariantId].reduce ((total, child) ->
          total + (child.inventoryQuantity || 0)
        ), 0
      
      # If the current `updatedVariant` has children with type `'inventory'`
      # add the count of inventory variants that it has to it's total
      if organizedChildren.inventoryChildren[updatedVariantId]?.length
        runningQty += organizedChildren.inventoryChildren[updatedVariantId].length
      
      # Account for change in qty to just updated variant
      if differenceInQty
        runningQty += differenceInQty
      
      # If this variant has _no children_, we need to add the difference in qty
      # to the current `inventoryQuantity`
      unless organizedChildren.children[updatedVariantId]
        runningQty += updatedVariant.inventoryQuantity || 0

      Products.direct.update({'_id': product._id, 'variants._id': updatedVariantId}, {$set: {'variants.$.inventoryQuantity': runningQty }})
      break unless updatedVariant.parentId # Break out of loop if top level variant
      updatedVariantId = updatedVariant.parentId
      updatedVariant = (variant for variant in product.variants when variant._id is updatedVariantId)[0]
  ## End InventoryQuantity Update Loop
    
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
