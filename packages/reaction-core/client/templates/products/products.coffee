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
#    This code duplicates functional described in dropdown.coffee:12
#    event.preventDefault()
#    event.stopPropagation()
#    $('.dropdown-toggle').dropdown('toggle') #close the menu

    Meteor.call "createProduct", (error, productId) ->
      if error
        console.log error
      else if productId
        Router.go "product",
          _id: productId
