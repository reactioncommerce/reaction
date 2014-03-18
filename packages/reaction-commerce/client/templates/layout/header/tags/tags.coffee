Template.headerTags.helpers
  tags: ->
    if @tag
      tags = []
      if Tags.findOne(@tag._id)
        tags.push(Tags.findOne(@tag._id))

        relatedTagIds = Tags.findOne(@tag._id).relatedTagIds
        if relatedTagIds
          for relatedTagId in relatedTagIds
            tags.push(Tags.findOne(relatedTagId))

    else
      tags = Tags.find({isTopLevel: true}, {sort: {position: 1}}).fetch()
      if @.tagIds
        for relatedTagId in @.tagIds
          unless (_.findWhere tags, _id: relatedTagId)
            tags.push(Tags.findOne(relatedTagId))
    tags.sort (a, b) ->
      a.position - b.position
    tags

  activeTag: (currentTag)->
    if Router.current().params._id is @._id then return "active"

  editableTag: (currentTag)->
    if Router.current().params._id is @._id then return "editable-tag"

Template.headerTags.events
  'click .active': (event,template) ->
    # event.stopPropogation()
    event.preventDefault()
    return

Template.headerTags.rendered = ->
  # $(@findAll("input")).autocomplete(
  #   delay: 0
  #   autoFocus: true
  #   source: (request, response) ->
  #     datums = []
  #     slug = _.slugify(request.term)
  #     Tags.find({slug: new RegExp(slug, "i")}).forEach (tag) ->
  #       datums.push(
  #         label: tag.name
  #       )
  #     response(datums)
  # )

  # *****************************************************
  # Inline field editing, handling
  # http://vitalets.github.io/x-editable/docs.html
  # *****************************************************
  if Meteor.app.hasOwnerAccess()
    $.fn.editable.defaults.disabled = false
    $.fn.editable.defaults.mode = "inline"
    $.fn.editable.defaults.showbuttons = false
    $.fn.editable.defaults.highlight = "#eff6db"
    $.fn.editable.defaults.clear = true

    #TODO: Implement Typeahead
    $("#header-add-tag").editable
      type: "text"
      emptytext: "add tag"
      inputclass: "navbar-form"
      success: (response, newValue) ->
        Meteor.call "updateHeaderTags", newValue, "",$(@).attr('data-current-id')
      validate: (value) ->
        if $.trim(value) is ""
          Alerts.add "A name is required"
          false

    $("#header-tags-list .editable-tag").editable
      type: "text"
      inputclass: "navbar-form"
      success: (response, newValue) ->
        if newValue
          Meteor.call "updateHeaderTags", newValue, $(@).attr('data-tag-id')
        else
          Meteor.call "removeHeaderTag", $(@).attr('data-tag-id')
          Router.go("index")

    $("#header-tags-list").sortable
      items: "> li .header-tag"
      axis: "x"
      update: (event, ui) ->
        uiPositions = $(@).sortable("toArray", attribute:"data-tag-id")
        for tag,index in uiPositions
          Tags.update(tag, {$set: {position: index}})

