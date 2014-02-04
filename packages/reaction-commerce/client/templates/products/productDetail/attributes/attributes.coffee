Template.attributes.helpers
  attributes: () ->
    (currentProduct.get "product").metafields

Template.attributes.events
  'click .attribute-delete': (e) ->
    # TODO: validate indexes when deleting? (duplicates, both get deleted)
    e.preventDefault()
    if confirm("Delete this detail?")
      Products.update (currentProduct.get "product")._id,
        $pull: metafields: this


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

    $(".attribute-key").editable
      type: "text"
      title: "Detail label"
      emptytext: "+ new label"
      success: (response, newValue) ->
        data = Spark.getDataContext(this)
        updateAttributes data,
          key: newValue
          value: data.value
          namespace: 'attributes'

    $(".attribute-value").editable
      type: "text"
      title: "Detail value"
      emptytext: "+ new details"
      success: (response, newValue) ->
        data = Spark.getDataContext(this)
        updateAttributes data,
          key: data.key
          value: newValue
          namespace: 'attributes'
      validate: (value) ->
        if $.trim(Spark.getDataContext(this).key) is ""
          throwAlert "A detail label is required"
          false


# *****************************************************
# Function to update product attributes
# param: property:value
# returns true or err
# *****************************************************
    updateAttributes = (data, newValue) ->
      attributes = (currentProduct.get "product").metafields
      if attributes
        for item in attributes
          if newValue.key and _.isEqual(item, data)
            item.key = newValue.key
            update = true
          if newValue.value and _.isEqual(item, data)
            item.value = newValue.value
            update = true

      if update
        Products.update (currentProduct.get "product")._id,
          $set: metafields: attributes, (error) ->
            if error
              throwAlert error
              false
            else
              true
      else
        Products.update (currentProduct.get "product")._id,
          $push: metafields: newValue, (error) ->
            if error
              throwAlert error
              false
            else
              true


