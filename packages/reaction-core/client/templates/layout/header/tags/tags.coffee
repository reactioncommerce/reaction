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

    #TODO: Implement Typeahead
    $("#header-add-tag").editable
      type: "text"
      emptytext: "add tag"
      success: (response, newValue) ->
        Meteor.call "updateHeaderTags", newValue, "",$(@).attr('data-current-id')
      validate: (value) ->
        if $.trim(value) is ""
          Alerts.add "A name is required"
          false

    $(".header-active-tag").editable
      type: "text"
      success: (response, newValue) ->
        console.log newValue
        if newValue
          Meteor.call "updateHeaderTags", newValue, $(@).attr('data-id')
        else
          Meteor.call "removeHeaderTag", $(@).attr('data-id')
          Router.go("index")


    $(".header-tags-list").sortable
      items: "> li.header-tags-item"
      axis: "x"
      update: (event, ui) ->
        tagId = ui.item[0].id
        uiPositions = $(this).sortable("toArray",attribute:"data-id")
        for tag,index in uiPositions
          Tags.update(tag, {$set: {position: index}})

