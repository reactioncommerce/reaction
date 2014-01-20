Template.productGrid.helpers
  products: ->
    getProductsByTag(@tag)

Template.cartItems.preserve([".product-grid-item-images"])

Template.productGridItems.events
  'click .clone-product': () ->
    Meteor.call "cloneProduct", this, (err, productId) ->
      console.log err  if err
      Router.go "shop/product",
        _id: productId

  'click .delete-product': (e) ->
    e.preventDefault()
    if confirm("Delete this product?")
      Products.remove this._id
      Router.go "/shop/products"

