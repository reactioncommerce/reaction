Meteor.methods
  ###
  # the cloneVariant method copies variants, but will also create and clone child variants (options)
  # productId,variantId to clone
  # add parentId to create children
  ###
  cloneVariant: (productId, variantId, parentId) ->
    unless Roles.userIsInRole(Meteor.userId(), ['admin'])
      return false
    product = Products.findOne(productId)
    variant = (variant for variant in product.variants when variant._id is variantId)
    clone = variant[0]

    #clean clone
    unless parentId
      clone.cloneId = productId
      clone._id = Random.id()
      delete clone.updatedAt
      delete clone.createdAt
      delete clone.inventoryQuantity
      delete clone.title
      Products._collection.update({_id:productId}, {$push: {variants: clone}})

    #make child clones
    children = (variant for variant in product.variants when variant.parentId is variantId)
    if children.length > 0 and !parentId
      # console.log "clone children"
      for childClone in children
        childClone._id = Random.id()
        childClone.parentId = clone._id
        Products._collection.update({_id:productId}, {$push: {variants: childClone}})
    else if parentId
      # console.log "create child clone"
      clone._id = Random.id()
      clone.parentId = variantId
      Products._collection.update({_id:productId}, {$push: {variants: clone}})

    return clone._id

  ###
  # initializes empty variant template (all others are clones)
  # should only be seen when all variants have been deleted from a product.
  ###
  createVariant: (productId) ->
    unless Roles.userIsInRole(Meteor.userId(), ['admin'])
      return false
    newVariant = { "_id": Random.id(), "title": "", "price": "0.00" }
    Products._collection.update({"_id": productId},{$addToSet:{"variants": newVariant}})

  ###
  # update individual variant with new values, merges into original
  # only need to supply updated information
  ###
  updateVariant: (variant) ->
    unless Roles.userIsInRole(Meteor.userId(), ['admin'])
      return false
    product = Products.findOne "variants._id":variant._id
    for variants,value in product.variants
      if variants._id is variant._id
        newVariant = _.extend variants,variant
    #TODO: check newVariant, ProductVariantSchema
    Products._collection.update({"_id":product._id,"variants._id":variant._id}, {$set: {"variants.$": newVariant}}, (error,result) ->
      console.log error if error
      return result if result
    )

  ###
  # update whole variants array
  ###
  updateVariants: (variants) ->
    unless Roles.userIsInRole(Meteor.userId(), ['admin'])
      return false
    product = Products.findOne "variants._id":variants[0]._id
    Products.update product._id, $set: variants: variants,(error,results) ->
      console.log error if error?

  ###
  # clone a whole product, defaulting visibility,etc
  # in the future we are going to do an inheritance product
  # that maintains relationships with the cloned
  # product tree
  ###
  cloneProduct: (product) ->
    unless Roles.userIsInRole(Meteor.userId(), ['admin'])
      return false
    #TODO: Really should be a recursive update of all _id
    i = 0
    handleCount = Products.find({"cloneId": product._id}).count() + 1
    product.cloneId = product._id
    product._id = Random.id()
    delete product.updatedAt
    delete product.createdAt
    delete product.publishedAt
    product.isVisible = false
    if product.handle then product.handle = product.handle + handleCount
    if product.title then product.title = product.title + handleCount

    while i < product.variants.length
      product.variants[i]._id = Random.id()
      i++
    newProduct = Products._collection.insert(product)
    newProduct


  ###
  # delete variant, which should also delete child variants
  ###
  deleteVariant: (variantId) ->
    unless Roles.userIsInRole(Meteor.userId(), ['admin'])
      return false
    if variantId
      Products.update {},
        $pull:
          variants:
            _id: variantId
        , multi: true
      Products.update {},
        $pull:
          variants:
            parentId: variantId
        , multi: true

  ###
  # when we create a new product, we create it with
  # an empty variant. all products have a variant
  # with pricing and details
  ###
  createProduct: () ->
    productId = Products._collection.insert({
      _id: Random.id()
      title: ""
      variants: [
        {
          _id: Random.id()
          title: ""
          price: 0.00
        }
      ]
    })

  ###
  # update single product field
  ###
  updateProductField: (productId, field,value) ->
    unless Roles.userIsInRole(Meteor.userId(), ['admin'])
      return false
    # value = Spacebars.SafeString(value)
    value  = EJSON.stringify value
    update = EJSON.parse "{\"" + field + "\":" + value + "}"
    return Products.update productId, $set: update

  ###
  # method to insert or update tag with hierachy
  # tagName will insert
  # tagName + tagId will update existing
  ###
  updateProductTags: (productId, tagName, tagId, currentTagId) ->
    unless Roles.userIsInRole(Meteor.userId(), ['admin'])
      return false
    newTag =
      slug: _.slugify(tagName)
      name: tagName

    existingTag = Tags.findOne({"name":tagName})

    if existingTag
      productCount = Products.find({"_id":productId,"hashtags":{$in:[existingTag._id]}}).count()

    if productCount > 0
      return
    #Exists
    if existingTag and productCount is 0
      Products.update(productId, {$push:{"hashtags":existingTag._id}})
      return
    else if tagId
      Tags.update(tagId,{$set:newTag})
      return
    else if !tagId# create a new tag
      # newTag.isTopLevel = !currentTagId
      newTag.isTopLevel = false
      newTag.shopId = Meteor.app.getCurrentShop()._id
      newTag.updatedAt = new Date()
      newTag.createdAt = new Date()
      newTag._id = Tags.insert(newTag)
      Products.update(productId, {$push:{"hashtags":newTag._id}})


  removeProductTag: (productId, tagId) ->
    unless Roles.userIsInRole(Meteor.userId(), ['admin'])
      return false

    Products.update(productId, {$pull: {"hashtags": tagId}})
    # if not in use delete from system
    productCount = Products.find({"hashtags":{$in:[tagId]}}).count()
    relatedTagsCount = Tags.find({"relatedTagIds":{$in:[tagId]}}).count()

    if (productCount is 0) and (relatedTagsCount is 0)
      Tags.remove(tagId)

  ###
  # update product grid positions
  # position is an object with tag,position,dimensions
  ###
  updateProductPosition: (productId, positionData) ->
    unless Roles.userIsInRole(Meteor.userId(), ['admin'])
      return false

    unless Products.findOne({'_id' :productId,"positions.tag":positionData.tag})
      Products._collection.update {_id: productId},
        {$addToSet:{ positions:positionData },$set:{updatedAt:new Date() } },
      , (error,results) ->
        console.log error if error
    else
      #Collection2 doesn't support elemMatch, use core collection
      Products._collection.update
        "_id": productId
        "positions.tag": positionData.tag
        ,
          $set:
            "positions.$.position": positionData.position
            "positions.$.updatedAt": new Date()
        ,
          (error,results) ->
            console.log error if error?

  updateMetaFields: (productId, updatedMeta, meta) ->
    unless Roles.userIsInRole(Meteor.userId(), ['admin'])
      return false
    if meta
      Products.update({"_id": productId, "metafields": meta}, {$set:{"metafields.$": updatedMeta} })
    else
      Products.update( "_id": productId, { "$addToSet": { "metafields": updatedMeta } })
