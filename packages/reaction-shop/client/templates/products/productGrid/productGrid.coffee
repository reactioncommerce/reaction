Template.productGrid.helpers
  products: ->
    getProductsByTag(@tag)


Template.productGridItems.helpers
  #placeholder for future image handling
  image: ->
    getVariantImage(this.variants[0]._id)

# Initialize packery on the first render of the productGrid
Template.productGrid.rendered = ->
  imagesLoaded @firstNode, ->
    container = document.querySelector(".product-grid")
    new Packery(document.querySelector(".product-grid"),
      gutter: 2
      columnWidth: 20
    )
