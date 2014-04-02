Meteor.methods
  ###
  # when we add a new variant, we clone the last one
  ###
  cloneVariant: (id, clone) ->
    clone._id = Random.id()
    Products._collection.update({_id:id}, {$push: {variants: clone}})
    clone._id

  createVariant: (productId) ->
    newVariant= [
            {
              _id: Random.id()
              title: ""
              price: 0.00
            }
          ]
    Products._collection.update(productId,{$set:{variants:newVariant}})
  ###
  # update individual variant with new values, merges into original
  # only need to supply updated information
  ###
  updateVariant: (variant) ->
    product = Products.findOne "variants._id":variant._id
    for variants,value in product.variants
      if variants._id is variant._id
        newVariant = _.extend variants,variant
    #TODO: check newVariant, ProductVariantSchema
    Products._collection.update({_id:product._id,"variants._id":variant._id}, {$set: {"variants.$": newVariant}})

  ###
  # update whole variants array
  ###
  updateVariants: (variants) ->
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
    #TODO: Really should be a recursive update of all _id
    i = 0
    product._id = Random.id()
    delete product.updatedAt
    delete product.createdAt
    delete product.publishedAt
    product.isVisible = false
    while i < product.variants.length
      product.variants[i]._id = Random.id()
      i++
    newProduct = Products._collection.insert(product)
    newProduct

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
  # update product grid positions
  # position is an object with tag,position,dimensions
  ###
  updateProductPosition: (productId,positionData) ->
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
            "updatedAt": new Date()
        ,
          (error,results) ->
            console.log error if error?
