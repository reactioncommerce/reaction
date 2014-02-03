Template.productGrid.helpers
  products: ->
    # take natual sort, sorting by updatedAt
    # then resort using positions.position for this tag
    # retaining natural sort of untouched items
    share.tag = @tag?._id ? ""
    gridProducts = getProductsByTag(@tag).fetch()
    #sort method
    compare = (a, b) ->
      if a.sortOrder is b.sortOrder
        x = a.updatedAt
        y = b.updatedAt
        return (if x > y then -1 else (if x < y then 1 else 0))
      a.sortOrder - b.sortOrder
    # get /create sortOrder positions
    for gridProduct,index in gridProducts
      if gridProduct.positions?
        for position in gridProduct.positions
          if position.tag is share.tag
            gridProducts[index].sortOrder = position.position
          else
            gridProducts[index].sortOrder = index
      else
        gridProducts[index].sortOrder = index
    ## helpful debug
    # for i,v in gridProducts.sort(compare)
    #   console.log v,i.sortOrder,i.title,i.updatedAt
    gridProducts.sort(compare)

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
      Router.go "/"

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
          ui.placeholder.css "padding-top", ui.helper.height() / 2
          ui.placeholder.css "border", "1px dashed #ccc"
          ui.placeholder.css "border-radius","6px"
          ui.placeholder.css "background-color","aliceblue"
          ui.placeholder.css "text-align","center"

