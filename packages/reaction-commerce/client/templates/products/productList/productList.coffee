Template.productListGrid.helpers
  currentTag: ->
    @tag

Template.productList.helpers
  products: ->
    getProductsByTag(@tag)

Template.productListGrid.events
  "click #productListView": ->
    $(".product-grid").hide()
    $(".product-list").show()
  "click #productGridView": ->
    $(".product-list").hide()
    $(".product-grid").show()
  "click .add-product-link": (event, template) ->
    event.preventDefault()
    event.stopPropagation()
    Meteor.call "createProduct", (error, productId) ->
      console.log error if error
      Router.go "product",
        _id: productId