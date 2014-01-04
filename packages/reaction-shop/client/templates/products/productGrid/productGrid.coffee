Template.productGrid.helpers
  products: ->
    getProductsByTag(@tag)


Template.productGridItems.helpers
  #placeholder for future image handling
  image: ->
    getVariantImage(this.variants[0]._id)

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

# Initialize packery on the first render of the productGrid
Template.productGrid.rendered = ->
  imagesLoaded @firstNode, ->
    container = document.querySelector(".product-grid")
    new Packery(document.querySelector(".product-grid"),
      gutter: 10
      transitionDuration: "0.2s"
    )
