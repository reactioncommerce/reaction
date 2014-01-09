Template.attributes.helpers
  attributes: () ->
    currentProductId = Session.get("currentProductId")
    attributes = Products.findOne(currentProductId).attributes

Template.attributes.events
  'click .attribute-delete': (e) ->
    # TODO: validate indexes when deleting? (duplicates, both get deleted)
    e.preventDefault()
    if confirm("Delete this detail?")
      currentProductId = Session.get("currentProductId")
      Products.update currentProductId,
        $pull: attributes: this


Template.attributes.rendered = ->
# *****************************************************
# Inline attribute editing
# TODO: Review editing whole row, rather than fields
# https://github.com/vitalets/x-editable/issues/80
# *****************************************************
  if Meteor.app.hasOwnerAccess()
    $.fn.editable.defaults.disabled = false
    $.fn.editable.defaults.mode = "inline"
    $.fn.editable.defaults.showbuttons = false
    $.fn.editable.defaults.onblur = 'submit'
    $.fn.editable.defaults.highlight = '#eff6db'

    $(".attribute-name").editable
      type: "text"
      title: "Detail name"
      emptytext: "+ new label"
      success: (response, newValue) ->
        data = Spark.getDataContext(this)
        updateAttributes data,name: newValue

    $(".attribute-value").editable
      type: "text"
      title: "Detail value"
      emptytext: "+ new details"
      success: (response, newValue) ->
        data = Spark.getDataContext(this)
        updateAttributes data,value: newValue
      validate: (value) ->
        if $.trim(Spark.getDataContext(this).name) is ""
          throwError "A detail label is required"
          false


# *****************************************************
# Function to update product attributes
# param: property:value
# returns true or err
# *****************************************************
    updateAttributes = (data, newValue) ->
      currentProductId = Session.get("currentProductId")

      attributes = Products.findOne(currentProductId)?.attributes
      if attributes
        for item in attributes
          if newValue.name and _.isEqual(item, data)
            item.name = newValue.name
            update = true
          if newValue.value and _.isEqual(item, data)
            item.value = newValue.value
            update = true

      if update
        Products.update currentProductId,
          $set: attributes: attributes, (error) ->
            if error
              throwError error
              false
            else
              true
      else
        Products.update currentProductId,
          $push: attributes: newValue, (error) ->
            if error
              throwError error
              false
            else
              true


