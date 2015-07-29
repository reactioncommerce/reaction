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
    barcode = @.barcode || "barcode not found"
    if confirm(i18n.t("productDetail.confirmDeleteBarcode") + ": "+ barcode)
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
    if(qty and parseInt(qty) > 0)
      Meteor.call "createInventoryVariants", productId, @._id, qty
      event.target.generateqty.value = ""
    else
      Alerts.add i18n.t('productDetail.quantityGreaterThanZero'), 'danger', placement: 'generateBarcodes'
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
