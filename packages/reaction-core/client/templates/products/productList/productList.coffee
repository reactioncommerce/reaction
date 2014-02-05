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
  "click .add-product-link": (e, t) ->
    e.preventDefault()
    e.stopPropagation()
    Meteor.call "createProduct", (err, productId) ->
      console.log err  if err
      Router.go "dashboard/product",
        _id: productId