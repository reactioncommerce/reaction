$(document).mouseup (e) ->
  container = $(".tag-edit-list")
  if not container.is(e.target) and container.has(e.target).length is 0
    currentTag = Session.get "currentTag"
    Session.set "isEditing-"+currentTag, false
  return


isEditing = (id) ->
  return Session.equals "isEditing-"+id, true

setEditing = (id, isEditing) ->
  Session.set "isEditing-"+id, isEditing


Template.headerTags.helpers
  tagsComponent: ->
    currentTag = Session.get "currentTag"
    if Session.equals "isEditing-"+currentTag, true
      return Template.tagInputForm
    else
      return Template.headerLinks

  tags: ->
    if @tag
      tags = []
      if Tags.findOne(@tag._id)
        Session.set "currentTag", @tag._id
        tags.push(Tags.findOne(@tag._id))

        relatedTagIds = Tags.findOne(@tag._id).relatedTagIds
        if relatedTagIds
          for relatedTagId in relatedTagIds
            tags.push(Tags.findOne(relatedTagId))

    else
      tags = Tags.find({isTopLevel: true}, {sort: {position: 1}}).fetch()
      Session.set "currentTag", ""
      if @.tagIds
        for relatedTagId in @.tagIds
          unless (_.findWhere tags, _id: relatedTagId)
            tags.push(Tags.findOne(relatedTagId))
    tags.sort (a, b) ->
      a.position - b.position
    tags

  activeTag: (currentTag)->
    if (Session.get "currentTag") is @._id then return "active"

  editableTag: (currentTag)->
    if (Session.get "currentTag") is @._id then return "true"

Template.tagInputForm.helpers
  tags: ()->
    tagList = []
    for tag in @.tags
      tagList.push tag._id
    return tagList.toString()


Template.headerLinks.events
  'click #header-edit-tag': (event,template) ->
    currentTag = Session.get "currentTag"
    Session.set "isEditing-"+currentTag, true
    Deps.flush()


Template.tagInputForm.events
  'click #btn-tags-cancel, click body': (event,template) ->
    currentTag = Session.get "currentTag"
    Session.set "isEditing-"+currentTag, false

  'click .tag-input-group-remove': (event,template) ->
    currentTag = Session.get "currentTag"
    Meteor.call "removeHeaderTag", @._id, currentTag

  'click .tags-input-select': (event,template) ->
    $(event.currentTarget).autocomplete(
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
    Deps.flush()

  'change .tags-input-select': (event,template) ->
    currentTag = Session.get "currentTag"
    Meteor.call "updateHeaderTags", $(event.currentTarget).val(), @._id, currentTag
    $('#tags-submit-new').val('')
    $('#tags-submit-new').focus()
    # Deps.flush()

  'blur.autocomplete': (event,template) ->
    if $(event.currentTarget).val()
      currentTag = Session.get "currentTag"
      Meteor.call "updateHeaderTags", $(event.currentTarget).val(), @._id, currentTag
      Deps.flush()
      $('#tags-submit-new').val('')
      $('#tags-submit-new').focus()

  'mousedown .tag-input-group-handle': (event,template) ->
    #Freaking meteor 0.8 kludge, this should be destroyed
    $(".tag-edit-list").sortable
      items: "> li"
      axis: "x"
      update: (event, ui) ->
        uiPositions = $(@).sortable("toArray", attribute:"data-tag-id")
        for tag,index in uiPositions
          Tags.update(tag, {$set: {position: index}})

#Template.headerTags.rendered = ->
  # *****************************************************
  # Inline field editing, handling
  # http://vitalets.github.io/x-editable/docs.html
  # *****************************************************
  # if Meteor.app.hasOwnerAccess()
  #   $(".tag-edit-list").sortable
  #     items: "> li"
  #     axis: "x"
  #     update: (event, ui) ->
  #       uiPositions = $(@).sortable("toArray", attribute:"data-tag-id")
  #       for tag,index in uiPositions
  #         Tags.update(tag, {$set: {position: index}})

