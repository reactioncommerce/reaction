#**********************************************************************************************************
# All product js is here.
#**********************************************************************************************************

# *****************************************************
# general helper to return products data
# returns object
# *****************************************************
Template.productListGrid.helpers
  tags: ->
    if @tag
      Tags.find({_id: {$in: @tag.relatedTagIds || []}})
    else
      Tags.find({isTopLevel: true})

Template.productGrid.helpers
  products: ->
    Products.find()

Template.productList.helpers
  products: ->
    Products.find()

Template.productGrid.rendered = ->
  new Packery(document.querySelector(".productGrid"), {gutter: 2})

Template.productListGrid.events
  "click #productListView": ->
    $(".productGrid").hide()
    $(".productList").show()
  "click #productGridView": ->
    $(".productList").hide()
    $(".productGrid").show()
  "click .shop-tag-add-form-toggle-link": (e, template) ->
    $(".shop-tag-add-form-toggle-link").hide()
    $(".shop-tag-add-form").show().find("input").first().focus()
  "submit .shop-tag-add-form": (e, template) ->
    e.preventDefault()
    currentTag = @tag
    $form = $(e.target)
    newTag = $form.serializeHash()
    newTag.isTopLevel = !currentTag
    newTag.shopId = packageShop.shopId
    newTag.updatedAt = new Date()
    newTag.createdAt = new Date()
    newTag._id = Tags.insert(newTag
    ,
      validationContext: "insert"
    ,
      (error, newTagId) ->
        if !error
          if currentTag
            Tags.update(currentTag._id, {$addToSet: {relatedTagIds: newTagId}})
    )
  "submit .current-shop-tag-edit-form": (e, template) ->
      e.preventDefault()
      $form = $(e.target)
      $set = $form.serializeHash()
      $set.updatedAt = new Date()
      Tags.update(@tag._id, {$set: $set}
      ,
        validationContext: "update"
      ,
        (error, newTagId) ->
      )
  "click .shop-tag-add-form .cancel-button": (e, template) ->
    e.preventDefault()
    $form = $(e.target).closest("form")
    $form.hide().get(0).reset()
    $(".shop-tag-add-form-toggle-link").show()
  "click .current-shop-tag-edit-form .cancel-button": (e, template) ->
    e.preventDefault()
    $form = $(e.target).closest("form")
    $form.hide().find("input[name='name']").val(@tag.name)
    $(".current-shop-tag-content").show()
  "click .current-shop-tag .edit-link": (e, template) ->
    $(".current-shop-tag-content").hide()
    $(".current-shop-tag-edit-form").show().find("input").first().focus()
  "click .current-shop-tag .remove-link": (e, template) ->
    $link = $(e.target)
    if confirm($link.data("confirm"))
      Tags.remove(@tag._id)
      Router.go("index")
