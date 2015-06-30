Template.inventoryVariantForm.helpers
  inventoryVariantFormId: () ->
    "inventory-variant-form-"+@._id
  
  removeInventoryVariantId: () ->
    "remove-inventory-variant-"+@._id

Template.inventoryVariantForm.events
  "click .inventory-variant-form :input, click li": (event,template) ->
    setCurrentVariant template.data._id

  "change .inventory-variant-form :input": (event,template) ->
    productId = selectedProductId()
    variant = template.data
    value = $(event.currentTarget).val()
    field = $(event.currentTarget).attr('name')
    variant[field] = value
    Meteor.call "updateVariant", variant, (error,result) ->
      if error then console.log "error updating variant", error
    setCurrentVariant template.data._id

  "click .remove-inventory-variant": (event, template) ->
    event.stopPropagation()
    event.preventDefault()
    barcode = @.barcode || "this barcode"
    if confirm("Are you sure you want to delete barcode: "+ barcode)
      id = @._id
      Meteor.call "deleteVariant", id, (error, result) ->
        if result and selectedVariantId() is id
          setCurrentVariant null

Template.generateInventoryVariantForm.events
  "submit .generate-inventory-variants-form": (event, template) ->
    event.stopPropagation()
    event.preventDefault()
    productId = selectedProductId()
    qty = event.target.generateqty.value
    
    Meteor.call "createInventoryVariants", productId, @._id, qty
    event.target.generateqty.value = ""
    return false


Template.addInventoryVariantForm.events
  "submit .add-inventory-variant-form": (event, template) ->
    event.stopPropagation()
    event.preventDefault()
    productId = selectedProductId()
    barcode = event.target.barcode.value
  
    Meteor.call "createInventoryVariant", productId, @._id, {barcode: barcode}
    event.target.barcode.value = ""
    return false
