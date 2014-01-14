Template.productGrid.helpers
  products: ->
    getProductsByTag(@tag)

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
# Template.productGrid.rendered = ->
#   imagesLoaded @firstNode, ->
#     container = document.querySelector(".product-grid")
#     new Masonry(document.querySelector(".product-grid"),
#       # gutter: 10
#       # columnWidth: ".img-responsive"
#       # transitionDuration: 0
#       itemSelector: '.item'
#     )
