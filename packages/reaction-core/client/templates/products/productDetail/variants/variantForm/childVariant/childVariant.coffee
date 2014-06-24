Template.childVariantForm.helpers
  childVariantFormId: () ->
    "child-variant-form-"+@._id

Template.childVariantForm.events
  "click .child-variant-form :input, click li": (event,template) ->
    unless (currentProduct.get "variant")._id is template.data._id
      currentProduct.set "variant", template.data

  "change .child-variant-form :input": (event,template) ->
    productId = (currentProduct.get "product")._id
    variant = template.data
    value = $(event.currentTarget).val()
    field = $(event.currentTarget).attr('name')
    variant[field] = value
    Meteor.call "updateVariant", variant, (error,result) ->
      if error then console.log error
    $(event.currentTarget).closest('td').next('td').find('input').focus()

  "click #remove-child-variant": (event, template) ->
    event.stopPropagation()
    event.preventDefault()
    optionTitle = @.optionTitle || "this option"
    if confirm("Are you sure you want to delete "+ optionTitle)
      Products.update (currentProduct.get "product")._id,
        $pull:
          variants:
            _id: @._id