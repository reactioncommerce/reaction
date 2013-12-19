Template.tags.helpers
  tags: ->
    if @_id
      tags = []
      if @relatedTagIds
        for relatedTagId in @relatedTagIds # maintain order
          tags.push(Tags.findOne(relatedTagId))
      tags
    else
      Tags.find({isTopLevel: true}, {sort: {position: 1}}).fetch()

Template.tags.rendered = ->
  $(@findAll("input")).autocomplete(
    delay: 0
    autoFocus: true
    source: (request, response) ->
      datums = []
      slug = _.slugify(request.term)
      Tags.find({slug: new RegExp(slug, "i")}).forEach (tag) ->
        datums.push(
          label: tag.name
        )
      response(datums)
  )

Template.tags.events
  "click .shop-tag-add-form-toggle-link": (e, template) ->
    $(".shop-tag-add-form-toggle-link").hide()
    $(".shop-tag-add-form").show().find("input").first().focus()
  "submit .shop-tag-add-form": (e, template) ->
    e.preventDefault()
    currentTagId = @_id
    $form = $(e.target)
    newTag = $form.serializeHash()
    newTag.slug = _.slugify(newTag.name)
    existingTag = Tags.findOne({slug: newTag.slug})
    if existingTag
      if currentTagId # don't merge conditions
        Tags.update(currentTagId, {$addToSet: {relatedTagIds: existingTag._id}})
      else
        Tags.update(existingTag._id, {$set: {isTopLevel: true, position: $(".shop-tags li").length + 1}})
    else
      newTag.isTopLevel = !currentTagId
      newTag.shopId = Meteor.app.shopId
      newTag.updatedAt = new Date()
      newTag.createdAt = new Date()
      newTag._id = Tags.insert(newTag
      ,
        validationContext: "insert"
      ,
        (error, newTagId) ->
          if !error
            if currentTagId
              Tags.update(currentTagId, {$addToSet: {relatedTagIds: newTagId}})
      )
    $form.get(0).reset()
  "submit .current-shop-tag-edit-form": (e, template) ->
      e.preventDefault()
      $form = $(e.target)
      $set = $form.serializeHash()
      $set.slug = _.slugify($set.name)
      $set.updatedAt = new Date()
      Tags.update(@_id, {$set: $set}
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
    $form.hide().find("input[name='name']").val(@name)
    $(".current-shop-tag-content").show()
  "click .current-shop-tag .edit-link": (e, template) ->
    $(".current-shop-tag-content").hide()
    $(".current-shop-tag-edit-form").show().find("input").first().focus()
  "click .current-shop-tag .remove-link": (e, template) ->
    $link = $(e.target)
    if confirm($link.data("confirm"))
      Tags.remove(@_id)
      Router.go("index")
  "click .shop-tag-reorder-start-link": (e, template) ->
    $(template.find(".shop-tags")).sortable(
      axis: "x"
      containment: "parent"
      cursor: "move"
      tolerance: "pointer"
    )
    $(template.find(".shop-tag-reorder-start-link")).hide()
    $(template.find(".shop-tag-reorder-stop-link")).show()
  "click .shop-tag-reorder-stop-link": (e, template) ->
    relatedTagIds = []
    $shopTags = $(template.find(".shop-tags"))
    $shopTags.find("li").each (index, element) ->
      relatedTagIds.push($(element).data("id"))
    if template.data._id
      Tags.update(template.data._id, {$set: {relatedTagIds: relatedTagIds}})
    else
      for relatedTagId, index in relatedTagIds
        Tags.update(relatedTagId, {$set: {position: index + 1}})
    $shopTags.sortable("destroy")
    $(template.find(".shop-tag-reorder-start-link")).show()
    $(template.find(".shop-tag-reorder-stop-link")).hide()

