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

  "dblclick .variant-list-item": (event) ->
    if Roles.userIsInRole(Meteor.user(), "admin") or @isOwner
      event.preventDefault()
      event.stopPropagation()
      Deps.flush()
      $('#variant-edit-form-'+@._id).toggle()

  "click .variant-detail > *": (event) ->
    event.preventDefault()
    event.stopPropagation()
    y = ((if document.pageYOffset then document.pageYOffset else document.body.scrollTop))
    currentProduct.set "variant", @
    $("html").scrollTop(y) or $("body").scrollTop(y)

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
    for variant in @.variants
      unless isNaN(variant.inventoryQuantity)
        inventoryTotal +=  variant.inventoryQuantity
    for variant in @.variants
      @variant
      variant.inventoryTotal = inventoryTotal
      variant.inventoryPercentage = parseInt((variant.inventoryQuantity / inventoryTotal) * 100)
      variant.inventoryWidth = parseInt((variant.inventoryPercentage - variant.title?.length ))
    @.variants

Template.variant.rendered = ->
  if Roles.userIsInRole(Meteor.user(), "admin") or @isOwner
    variantSort = $(".variant-list")
    variantSort.sortable
        items: "> li.variant-list-item"
        cursor: "move"
        opacity: 0.3
        helper: "clone"
        placeholder: "variant-sortable"
        forcePlaceholderSize: true
        axis: "y"
        update: (event, ui) ->
          productVariants = (currentProduct.get "product").variants
          uiPositions = $(this).sortable("toArray",attribute:"data-id")
          newVariants = []
          # first just go through the new index
          for id in uiPositions
            for variant in productVariants
              if variant._id is id
                newVariants.push variant
          Meteor.defer ->
            Meteor.call "updateVariants", newVariants

        start: (event, ui) ->
          ui.placeholder.height ui.helper.height()
          ui.placeholder.html "Drop variant to reorder"
          ui.placeholder.css "padding-top", ui.helper.height() / 3
          ui.placeholder.css "border", "1px dashed #ccc"
          ui.placeholder.css "border-radius","6px"

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