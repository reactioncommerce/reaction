isMovingTag = false

isEditing = (id) ->
  return Session.equals "isEditing-"+id, true

setEditing = (id, isEditing) ->
  Session.set "isEditing-"+id, isEditing
  return

currentTag = ->
  return Session.get "currentTag"

$(document).mouseup (e) ->
  container = $(".tag-edit-list")
  if not isMovingTag and not container.is(e.target) and container.has(e.target).length is 0
    setEditing currentTag(), false
  return

Template.headerTags.helpers
  tagsComponent: ->
    # If we're an admin with the header in edit mode, we display
    # the tag edit form, else the normal header tag links
    if isEditing(currentTag()) and ReactionCore.hasOwnerAccess()
      return Template.tagInputForm
    else
      return Template.headerLinks

  tags: ->
    # If we're on a product/tag page
    if @tag
      tags = []
      tagDoc = Tags.findOne @tag._id
      unless tagDoc
        Session.set "currentTag", ""
        return tags
      # Note the current product/tag page we're on
      Session.set "currentTag", @tag._id
      # Display that tag first in the header
      tags.push(tagDoc)
      # Display all related tags next in the header
      relatedTagIds = tagDoc.relatedTagIds
      if relatedTagIds
        for relatedTagId in relatedTagIds
          tags.push(Tags.findOne(relatedTagId))
    # All other pages
    else
      # Display all top level tags
      tags = Tags.find({isTopLevel: true}, {sort: {position: 1}}).fetch()
      # Note that we're not on a product/tag page
      Session.set "currentTag", ""
      # If we've passed a specific list of tag IDs,
      # also display all those tags
      # XXX Seems to be unused?
      if @.tagIds
        for relatedTagId in @.tagIds
          unless (_.findWhere tags, _id: relatedTagId)
            tags.push(Tags.findOne(relatedTagId))
    # Sort the tag list by tag.position before we return it
    tags.sort (a, b) ->
      a.position - b.position
    return tags

Template.headerLinks.helpers
  activeTag: ->
    return "active" if Session.equals "currentTag", @._id

Template.tagInputForm.helpers
  tags: ->
    tagList = []
    for tag in @.tags
      tagList.push tag._id
    return tagList.toString()


Template.headerLinks.events
  'click #header-edit-tag': (event,template) ->
    setEditing currentTag(), true
    Tracker.flush()

Template.tagInputForm.events
  'click .tag-input-group-remove': (event,template) ->
    Meteor.call "removeHeaderTag", @._id, currentTag(), (error, result) ->
      if error
        console.log "Error removing header tag", error
      template.$('.tags-submit-new').focus()

  'click .tags-input-select': (event,template) ->
    $(event.currentTarget).autocomplete(
      delay: 0
      autoFocus: true
      source: (request, response) ->
        datums = []
        slug = getSlug request.term
        Tags.find({slug: new RegExp(slug, "i")}).forEach (tag) ->
          datums.push(
            label: tag.name
          )
        response(datums)
    )
    Tracker.flush()

  'blur.autocomplete, change .tags-input-select': (event,template) ->
    val = $(event.currentTarget).val()
    if val
      Meteor.call "updateHeaderTags", val, @._id, currentTag(), (error, result) ->
        if error
          console.log "Error updating header tags", error
        Tracker.flush()
        template.$('.tags-submit-new').val('').focus()

  'mousedown .tag-input-group-handle': (event,template) ->
    isMovingTag = true
    Tracker.flush()
    template.$(".tag-edit-list").sortable("refresh")

Template.tagInputForm.rendered = ->
  # *****************************************************
  # Inline field editing, handling
  # http://vitalets.github.io/x-editable/docs.html
  # *****************************************************
    $(".tag-edit-list").sortable
      items: "> li"
      axis: "x"
      handle: '.tag-input-group-handle'
      update: (event, ui) ->
        uiPositions = $(@).sortable("toArray", attribute:"data-tag-id")
        for tag,index in uiPositions
          Tags.update tag, {$set: {position: index}}
      stop: (event, ui) ->
        isMovingTag = false
