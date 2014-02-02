Template.productGrid.helpers
  products: ->
    share.tag = @tag?._id ? ""

    products = getProductsByTag(@tag).fetch()

    for product,index in products
      if product.positions?
        for position in product.positions
          if position.tag is share.tag
            products[index].sortOrder = position.position
            console.log position.tag,products.sortOrder

    sortedArray = _.sortBy(products, (obj) ->
      obj.sortOrder
    )
    sortedArray

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

Template.productGridItems.rendered = () ->
  # *****************************************************
  #  drag grid products and save tag+position
  # *****************************************************
  if Roles.userIsInRole(Meteor.user(), "admin") or @isOwner
    productSort = $(".product-grid-list")
    productSort.sortable
        items: "> li.product-grid-item"
        cursorAt: { cursor: "move", top: 25, left: 200 }
        opacity: 0.5
        helper: "clone"
        placeholder: "product-sortable"
        forcePlaceholderSize: true
        revert: true
        update: (event, ui) ->
          productId = ui.item[0].id
          uiPositions = $(this).sortable("toArray",attribute:"data-id")
          index = _.indexOf uiPositions, productId
          position =
            tag: share.tag
            position: index
          Meteor.defer ->
            Meteor.call "updateProductPosition", productId, position
          Deps.flush()

        start: (event, ui) ->
          ui.placeholder.height ui.helper.height()
          ui.placeholder.html "<h2>Drop product to reorder</h2>"
          ui.placeholder.css "padding-top", ui.helper.height() / 3
          ui.placeholder.css "border", "1px dashed #ccc"
          ui.placeholder.css "border-radius","6px"
