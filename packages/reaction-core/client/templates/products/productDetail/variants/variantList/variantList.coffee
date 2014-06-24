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
      if current?._id
        if current.parentId?
          variants = (variant for variant in product.variants when variant.parentId is current.parentId and variant.optionTitle)
        else
          variants = (variant for variant in product.variants when variant.parentId is current._id and variant.optionTitle)
        return variants

Template.variantList.events
  # "submit form": (event,template) ->
  #   unless (currentProduct.get "variant")._id is template.data._id
  #     currentProduct.set "variant", template.data

  "click #create-variant": (event) ->
    Meteor.call "createVariant", @._id

  "click .variant-select-option": (event,template) ->
    Alerts.removeSeen()
    unless (currentProduct.get "variant")._id is @._id
      currentProduct.set "variant", @