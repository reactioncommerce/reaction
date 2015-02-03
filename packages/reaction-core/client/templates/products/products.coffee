Template.products.events
  "click #productListView": ->
    $(".product-grid").hide()
    $(".product-list").show()

  "click #productGridView": ->
    $(".product-list").hide()
    $(".product-grid").show()

  "click .product-list-item": (event, template) ->
    Router.go "product",
      _id: @._id
