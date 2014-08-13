Template.variantForm.helpers
  variantDetails: ->
    unless @.parentId?
      return Template.parentVariantForm
    else
      return Template.childVariantForm

  childVariants: () ->
    product = selectedProduct()
    return unless product
    return (variant for variant in product.variants when variant?.parentId is @_id)

  nowDate: () ->
    return new Date()

  variantFormId: () ->
    return "variant-form-"+@._id

  variantFormVisible: () ->
    unless Session.equals "variant-form-"+@._id, true
      return "hidden"

  displayInventoryManagement: () ->
    unless @inventoryManagement is true
      return "display:none;"

  displayLowInventoryWarning: () ->
    unless @inventoryManagement is true
      return "display:none;"

Template.variantForm.events
  "change form :input": (event,template) ->
    # auto-submit the variant form whenever any fields are changed
    formId = "#variant-form-"+template.data._id
    template.$(formId).submit()
    setCurrentVariant template.data._id
    return

  "click .btn-child-variant-form": (event,template) ->
    event.stopPropagation()
    event.preventDefault()
    productId = selectedProductId()
    return unless productId
    Meteor.call "cloneVariant", productId, template.data._id, @._id
    return

  "click .btn-remove-variant": (event, template) ->
    title = @.title || "this variant"
    if confirm("Are you sure you want to delete "+ title)
      id = @._id
      Meteor.call "deleteVariant", id, (error, result) ->
        if result and selectedVariantId() is id
          setCurrentVariant null
    return

  "click .btn-clone-variant": (event,template) ->
    event.stopPropagation()
    event.preventDefault()
    productId = selectedProductId()
    return unless productId
    Meteor.call "cloneVariant", productId, template.data._id, (error,result) ->
      toggleSession "variant-form-"+result
    return