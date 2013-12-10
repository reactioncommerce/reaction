#**********************************************************************************************************
# All product js is here.
#**********************************************************************************************************

# *****************************************************
# general helper to return products data
# returns object
# *****************************************************
Template.productListGrid.helpers
  currentTag: ->
    @tag

Template.productGrid.helpers
  products: ->
    getProductsByTag(@tag)

Template.productList.helpers
  products: ->
    getProductsByTag(@tag)

Template.productGrid.rendered = ->
  new Packery(document.querySelector(".productGrid"), {gutter: 2})

Template.productListGrid.events
  "click #productListView": ->
    $(".productGrid").hide()
    $(".productList").show()
  "click #productGridView": ->
    $(".productList").hide()
    $(".productGrid").show()

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
  Products.find(selector)
