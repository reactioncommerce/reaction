Template.variant.helpers
  progressBar: () ->
    if @.inventoryPercentage <= 10 then "progress-bar-danger"
    else if @.inventoryPercentage <= 30 then "progress-bar-warning"
    else "progress-bar-success"
  selectedVariant: () ->
    if @._id is (currentProduct.get "variant")?._id
      return "variant-detail-selected"

Template.variant.events
  "click .remove-variant": (event, template) ->
    if confirm($(event.target).closest("a").data("confirm"))
      Products.update (currentProduct.get "product")._id,
        $pull:
          variants:
            _id: @._id

  "click .edit-variant": (event) ->
    event.preventDefault()
    event.stopPropagation()
    $('#variant-edit-form-'+@._id).toggle()

  "dblclick .variant-list": (event) ->
    if Roles.userIsInRole(Meteor.user(), "admin") or @isOwner
      event.preventDefault()
      event.stopPropagation()
      Deps.flush()
      $('#variant-edit-form-'+@._id).toggle()

  "click .variant-list > *": (event) ->
    currentProduct.set "variant", @

  "click .clone-variant": (event,template) ->
    #clean selected variant
    newVariant = _.clone @
    delete newVariant._id
    delete newVariant.updatedAt
    delete newVariant.createdAt
    delete newVariant.inventoryQuantity
    delete newVariant.inventoryTotal
    delete newVariant.inventoryPercentage
    delete newVariant.inventoryWidth
    delete newVariant.title
    # clone the variant
    Meteor.call "cloneVariant", (currentProduct.get "product")._id, newVariant, (error, result) ->
      if result
        Deps.flush()
        $('#variant-edit-form-'+result).toggle()
        event.preventDefault()
        event.stopPropagation()

Template.variantList.helpers
  variants: () ->
    inventoryTotal = 0
    (inventoryTotal +=  variant.inventoryQuantity) for variant in @.variants
    for variant in @.variants
      @variant
      variant.inventoryTotal = inventoryTotal
      variant.inventoryPercentage = parseInt((variant.inventoryQuantity / inventoryTotal) * 100)
      variant.inventoryWidth = parseInt((variant.inventoryPercentage - variant.title?.length ))
    @.variants

Template.variantList.rendered = ->
  # *****************************************************
  # Editable variants entry
  # Format
  #    :description => 'Author of book',
  #    :namespace => 'book',
  #    :key => 'author',
  #    :value => 'Kurt Vonnegut',
  #    :value_type => 'string'
  # *****************************************************
  $("#variants").editable
    inputclass: "input-large"
    select2:
      width: "250px"
      initSelection: (element, callback) ->
        data = []
        data =
          id: "1"
          text: "text"

        callback data

      data: (element, callback) ->
        data = []
        data =
          id: "2"
          text: "text2"

        callback data

    success: (response, newValue) ->
      updateProduct variants: newValue


Template.variantList.events
  "click #create-variant": (event) ->
    newVariant= [
            {
              _id: Random.id()
              title: ""
              price: 0.00
            }
          ]
    Products._collection.update(@._id,{$set:{variants:newVariant}})
