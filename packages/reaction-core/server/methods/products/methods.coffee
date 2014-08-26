Media = ReactionCore.Collections.Media

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

    return false unless variant.length > 0

    clone = variant[0]
    clone._id = Random.id()

    if parentId
      # console.log "create child clone"
      clone.parentId = variantId
      Products.update({_id:productId}, {$push: {variants: clone}}, {validate: false})
      return clone._id

    #clean clone
    clone.cloneId = productId
    delete clone.updatedAt
    delete clone.createdAt
    delete clone.inventoryQuantity
    delete clone.title
    Products.update({_id:productId}, {$push: {variants: clone}}, {validate: false})

    #make child clones
    children = (variant for variant in product.variants when variant.parentId is variantId)
    if children.length > 0
      # console.log "clone children"
      for childClone in children
        childClone._id = Random.id()
        childClone.parentId = clone._id
        Products.update({_id:productId}, {$push: {variants: childClone}}, {validate: false})

    return clone._id

  ###
  # initializes empty variant template (all others are clones)
  # should only be seen when all variants have been deleted from a product.
  ###
  createVariant: (productId) ->
    unless Roles.userIsInRole(Meteor.userId(), ['admin'])
      return false
    newVariant = { "_id": Random.id(), "title": "", "price": "0.00" }
    Products.update({"_id": productId},{$addToSet:{"variants": newVariant}}, {validate: false})

  ###
  # update individual variant with new values, merges into original
  # only need to supply updated information
  ###
  updateVariant: (variant) ->
    unless Roles.userIsInRole(Meteor.userId(), ['admin'])
      return false
    product = Products.findOne "variants._id":variant._id
    if product?.variants
      for variants,value in product.variants
        if variants._id is variant._id
          newVariant = _.extend variants,variant
      Products.update({"_id":product._id,"variants._id":variant._id}, {$set: {"variants.$": newVariant}}, {validate: false}, (error,result) ->
        console.log error if error
        return
      )

  ###
  # update whole variants array
  ###
  updateVariants: (variants) ->
    unless Roles.userIsInRole(Meteor.userId(), ['admin'])
      return false
    product = Products.findOne "variants._id":variants[0]._id
    Products.update product._id, $set: variants: variants, {validate: false}, (error,results) ->
      console.log error if error
      return

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

    #clean the product and give it a new ID and title
    product.cloneId = product._id
    product._id = Random.id()
    delete product.updatedAt
    delete product.createdAt
    delete product.publishedAt
    delete product.handle
    product.isVisible = false
    if product.title then product.title = product.title + handleCount

    #make new random IDs for all variants
    while i < product.variants.length
      #TODO Clone images with clone variants
      newVariantId = Random.id()
      oldVariantId = product.variants[i]._id
      product.variants[i]._id = newVariantId
      Media.find({'metadata.variantId': oldVariantId}).forEach (fileObj) ->
        newFile = fileObj.copy()
        newFile.metadata.productId = product._id
        newFile.metadata.variantId = newVariantId
        Media.insert newFile
      unless product.variants[i].parentId
        while i < product.variants.length
          if product.variants[i].parentId == oldVariantId
            product.variants[i].parentId = newVariantId
          i++
      i++

    #create the cloned product
    return Products.insert(product, {validate: false})

  ###
  # delete variant, which should also delete child variants
  ###
  deleteVariant: (variantId) ->
    check variantId, String
    unless Roles.userIsInRole(Meteor.userId(), ['admin'])
      return false
    #what will we be deleteing?
    deleted = Products.find({$or: [{"variants.parentId": variantId}, {"variants._id": variantId}]}).fetch()
    #delete variants with this variant as parent
    Products.update {"variants.parentId": variantId},{$pull: 'variants':{'parentId': variantId}}
    #delete this variant
    Products.update {"variants._id": variantId},{$pull: 'variants':{'_id': variantId}}
    # unlink media
    _.each deleted, (product) ->
      _.each product.variants, (variant) ->
        if variant.parentId is variantId or variant._id is variantId
          Media.update 'metadata.variantId': variant._id,
            $unset:
              'metadata.productId': ""
              'metadata.variantId': ""
              'metadata.priority': ""
          , multi: true
    return true

  ###
  # when we create a new product, we create it with
  # an empty variant. all products have a variant
  # with pricing and details
  ###
  createProduct: () ->
    unless Roles.userIsInRole(Meteor.userId(), ['admin'])
      return false
    return Products.insert({
      _id: Random.id()
      title: ""
      variants: [
        {
          _id: Random.id()
          title: ""
          price: 0.00
        }
      ]
    }, {validate: false})

  ###
  # delete a product and unlink it from all media
  ###
  deleteProduct: (id) ->
    unless Roles.userIsInRole(Meteor.userId(), ['admin'])
      return false
    numRemoved = Products.remove id
    if numRemoved > 0
      # unlink media
      Media.update 'metadata.productId': id,
        $unset:
          'metadata.productId': ""
          'metadata.variantId': ""
          'metadata.priority': ""
      , multi: true
      return true
    else
      return false

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
      return false if productCount > 0
      Products.update(productId, {$push:{"hashtags":existingTag._id}})
    else if tagId
      Tags.update tagId, {$set:newTag}
    else # create a new tag
      # newTag.isTopLevel = !currentTagId
      newTag.isTopLevel = false
      newTag.shopId = ReactionCore.getShopId()
      newTag.updatedAt = new Date()
      newTag.createdAt = new Date()
      newTag._id = Tags.insert(newTag)
      Products.update(productId, {$push:{"hashtags":newTag._id}})
    return

  ###
  # remove product tag
  ###
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
  # set or toggle product handle
  ###
  setHandleTag: (productId, tagId) ->
    unless Roles.userIsInRole(Meteor.userId(), ['admin'])
      return false
    product = Products.findOne(productId)
    tag = Tags.findOne(tagId)
    #if is already assigned, unset (toggle off)
    if productId.handle is tag.slug
      Products.update(product._id, {$unset:{"handle":""}})
      return product._id
    else
      existingHandles = Products.find({handle: tag.slug}).fetch()
      #reset any existing handle to product id
      for currentProduct in existingHandles
        Products.update(currentProduct._id, {$unset:{"handle":""}})
      #update handle to tag.slug (lowercase tag)
      Products.update(product._id, {$set:{"handle":tag.slug}})
      return tag.slug

  ###
  # update product grid positions
  # position is an object with tag,position,dimensions
  ###
  updateProductPosition: (productId, positionData) ->
    unless Roles.userIsInRole(Meteor.userId(), ['admin'])
      return false

    unless Products.findOne({'_id' :productId,"positions.tag":positionData.tag})
      Products.update {_id: productId},
        {$addToSet:{ positions:positionData },$set:{updatedAt:new Date() } },
      , (error,results) ->
        console.log error if error
    else
      #Collection2 doesn't support elemMatch, use core collection
      Products.update
        "_id": productId
        "positions.tag": positionData.tag
        ,
          $set:
            "positions.$.position": positionData.position
            "positions.$.updatedAt": new Date()
        ,
          (error,results) ->
            console.log error if error

  updateMetaFields: (productId, updatedMeta, meta) ->
    unless Roles.userIsInRole(Meteor.userId(), ['admin'])
      return false
    if meta
      Products.update({"_id": productId, "metafields": meta}, {$set:{"metafields.$": updatedMeta} })
    else
      Products.update( "_id": productId, { "$addToSet": { "metafields": updatedMeta } })
