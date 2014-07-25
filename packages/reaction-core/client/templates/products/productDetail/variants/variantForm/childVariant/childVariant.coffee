Template.childVariantForm.helpers
  childVariantFormId: () ->
    "child-variant-form-"+@._id

Template.childVariantForm.events
  "click .child-variant-form :input, click li": (event,template) ->
    setCurrentVariant template.data._id

  "change .child-variant-form :input": (event,template) ->
    productId = selectedProductId()
    variant = template.data
    value = $(event.currentTarget).val()
    field = $(event.currentTarget).attr('name')
    variant[field] = value
    Meteor.call "updateVariant", variant, (error,result) ->
      if error then console.log error
    setCurrentVariant template.data._id

  "click #remove-child-variant": (event, template) ->
    event.stopPropagation()
    event.preventDefault()
    optionTitle = @.optionTitle || "this option"
    if confirm("Are you sure you want to delete "+ optionTitle)
      id = @._id
      Meteor.call "deleteVariant", id, (error, result) ->
        if result and selectedVariantId() is id
          setCurrentVariant null