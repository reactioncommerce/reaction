Products.before.insert (userId, product) ->
  product.shopId = product.shopId || Meteor.app.getCurrentShop()._id # avoid calling if present
  _.defaults(product,
    productType: "New type"
    handle: _.slugify(product.title)
    isVisible: false
    updatedAt: new Date()
    createdAt: new Date()
  )
  for variant in product.variants
    _.defaults(variant,
      _id: Random.id()
      inventoryManagement: "reaction"
      inventoryPolicy: "deny"
      updatedAt: new Date()
      createdAt: new Date()
    )
