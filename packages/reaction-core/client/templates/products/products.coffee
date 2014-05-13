Template.addProductLinks.events
  "click #productListView": ->
    $(".product-grid").hide()
    $(".product-list").show()

  "click #productGridView": ->
    $(".product-list").hide()
    $(".product-grid").show()

  "click .product-list-item": (event, template) ->
    Router.go "product",
      _id: @._id

  "click #add-product-link": (event, template) ->
    event.preventDefault()
    event.stopPropagation()
    Meteor.call "createProduct", (error, productId) ->
      console.log error if error
      Router.go "product",
        _id: productId