Template.productGrid.helpers
  products: ->
    getProductsByTag(@tag)


Template.productGridItems.helpers
  #placeholder for future image handling
  image: ->
    getVariantImage(this.variants[0]._id)

Template.productGridItems.events
  'click .fa-code-fork': () ->
    Meteor.call "cloneProduct", this, (err, productId) ->
      console.log err  if err
      Router.go "shop/product",
        _id: productId

# Initialize packery on the first render of the productGrid
Template.productGrid.rendered = ->
  $().tooltip({container: 'body'})
  imagesLoaded @firstNode, ->
    container = document.querySelector(".product-grid")
    new Packery(document.querySelector(".product-grid"),
      gutter: 2
      columnWidth: 20
    )
