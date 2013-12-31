#**********************************************************************************************************
# All product js is here.
#**********************************************************************************************************

# *****************************************************
# general helper to return products data
# returns object
# *****************************************************


# Respond to added, moved, removed callbacks on products
Template.productListGrid.helpers
  currentTag: ->
    @tag

Template.productGrid.helpers
  products: ->
    getProductsByTag(@tag)

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
    productId = Products.insert({
      title: "New product"
      variants: [
        {
          title: "New product variant"
          price: 0
        }
      ]
    })
    Router.go("shop/product",
      _id: productId
    )

# Initialize packery on the first render of the productGrid
Template.productGrid.rendered = ->
  imagesLoaded @firstNode, ->
    container = document.querySelector(".product-grid")
    new Packery(document.querySelector(".product-grid"),
      gutter: 2
      columnWidth: 20
    )

# *****************************************************
# method to return tag specific product
# *****************************************************
getProductsByTag = (tag) ->
  selector = {}
  if tag
    tagIds = []
    relatedTags = [tag]
    while relatedTags.length
      newRelatedTags = []
      for relatedTag in relatedTags
        if tagIds.indexOf(relatedTag._id) == -1
          tagIds.push(relatedTag._id)
          if relatedTag.relatedTagIds?.length
            newRelatedTags = _.union(newRelatedTags, Tags.find({_id: {$in: relatedTag.relatedTagIds}}).fetch())
      relatedTags = newRelatedTags
    selector.tagIds = {$in: tagIds}
  cursor = Products.find(selector)