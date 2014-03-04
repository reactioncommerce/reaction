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
    tags

  activeTag: (currentTag)->
    if @_id is currentTag then return "active-tag"


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
    $.fn.editable.defaults.showbuttons = true
    # $.fn.editable.defaults.onblur = 'submit'
    $.fn.editable.defaults.highlight = '#eff6db'
    $.fn.editable.defaults.clear = true

    $("#header-add-tag").editable
      type: "text"
      emptytext: "add tag"
      success: (response, newValue) ->
        Meteor.call "updateHeaderTags", newValue, "",$(@).attr('data-current-id')
      validate: (value) ->
        if $.trim(value) is ""
          throwAlert "A name is required"
          false

    $(".header-active-tag").editable
      type: "text"
      success: (response, newValue) ->
        Meteor.call "updateHeaderTags", newValue, $(@).attr('data-id')
      validate: (value) ->
        if $.trim(value) is ""
          throwAlert "A name is required"
          false


