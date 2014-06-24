Template.variant.helpers
  progressBar: () ->
    if @.inventoryPercentage <= 10 then "progress-bar-danger"
    else if @.inventoryPercentage <= 30 then "progress-bar-warning"
    else "progress-bar-success"

  selectedVariant: () ->
    current = (currentProduct.get "variant")
    if (@._id is current?._id ) or  (@._id is current?.parentId)
      return "variant-detail-selected"

  isSoldOut: () ->
      if @.inventoryQuantity < 1
          return true
      return false

Template.variant.events
  "click .edit-variant": (event) ->
    currentProduct.set "variant", @
    toggleSession "variant-form-"+@._id

  "dblclick .variant-progress-item": (event) ->
    if Roles.userIsInRole(Meteor.user(), "admin") or @isOwner
      currentProduct.set "variant", @
      toggleSession "variant-form-"+@._id

  "click .variant-detail > *": (event) ->
    event.preventDefault()
    event.stopPropagation()
    Alerts.removeSeen()
    currentProduct.set "variant", @


Template.variantList.helpers
  variants: () ->
    product  = currentProduct.get "product"
    if product
      variants = (variant for variant in product.variants when !variant.parentId?)
      inventoryTotal = 0
      for variant in variants
        unless isNaN(variant.inventoryQuantity)
          inventoryTotal +=  variant.inventoryQuantity
      for variant in variants
        @variant
        variant.inventoryTotal = inventoryTotal
        variant.inventoryPercentage = parseInt((variant.inventoryQuantity / inventoryTotal) * 100)
        variant.inventoryWidth = parseInt((variant.inventoryPercentage - variant.title?.length ))
      variants

  childVariants: () ->
    product  = currentProduct.get "product"
    if product
      current = (currentProduct.get "variant")
      if current._id
        if current.parentId?
          variants = (variant for variant in product.variants when variant.parentId is current.parentId and variant.optionTitle)
        else
          variants = (variant for variant in product.variants when variant.parentId is current._id and variant.optionTitle)
        return variants



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

          for id, index in uiPositions
            for variant, pindex in productVariants
              if variant?._id is id
                newVariants[index] = variant
                delete productVariants[pindex]

          updateVariants = _.union productVariants, newVariants
          Meteor.defer ->
            Meteor.call "updateVariants", updateVariants

        start: (event, ui) ->
          ui.placeholder.height ui.helper.height()
          ui.placeholder.html "Drop variant to reorder"
          ui.placeholder.css "padding-top", ui.helper.height() / 3
          ui.placeholder.css "border", "1px dashed #ccc"
          ui.placeholder.css "border-radius","6px"

Template.variantList.events
  "submit form": (event,template) ->
    console.log @
    console.log template.data
    unless (currentProduct.get "variant")._id is template.data._id
      currentProduct.set "variant", template.data

  "click #create-variant": (event) ->
    Meteor.call "createVariant", @._id

  "click .variant-select-option": (event,template) ->
    Alerts.removeSeen()
    unless (currentProduct.get "variant")._id is @._id
      currentProduct.set "variant", @