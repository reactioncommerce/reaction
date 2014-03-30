Template.variantForm.helpers
  # variantFormSchema: ->
  #   variantSchema = new AutoForm ProductVariantSchema
  #   variantSchema

  # data: ->
  #   console.log this
  #   return this.data

  nowDate: ->
    new Date()

  formId: ->
    "variant-form-"+@._id

  metafieldKeyIndex: ->
    return "metafields."+@.index+".key"

  metafieldValueIndex: ->
    return "metafields."+@.index+".value"

  metafieldsIndexed: ->
    metafieldArray = new Array
    value = 0
    if @.metafields
      for item,value in @.metafields
        metafieldArray[value] =
          index: value
          key: item.key
          value: item.value
    metafieldArray.push {index: value} if metafieldArray?
    metafieldArray

  inventoryManagementOptions: ->
    options = [
      {label: "Manual",value: "manual"},
      {label: "Reaction",value: "reaction"}
    ]
    options

  inventoryPolicyOptions: ->
    options = [
      {label: "Continue",value: "continue"},
      {label: "Deny",value: "deny"}
    ]
    options

  displayInventoryManagement: (doc) ->
    unless @.inventoryManagement
      return "display:none;"

  displayLowInventoryWarning: (doc) ->
    unless @.inventoryManagement
      return "display:none;"

Template.variantForm.events
  "submit form": (event,template) ->
    currentProduct.changed "product"

  "change input[name='inventoryManagement']": (event,template) ->
    event.stopPropagation()
    if !$( event.currentTarget ).is(':checked')
        $( '#' + @._formID ).find( 'input[name=inventoryPolicy]' ).attr("checked",false)
    $( '#' + @._formID ).find( '.inventoryPolicy, .lowInventoryWarning' ).slideToggle()

  "change input[name='lowInventoryWarning']": (event,template) ->
    event.stopPropagation()
    if !$( event.currentTarget ).is(':checked')
        $( '#' + @._formID ).find( 'input[name="lowInventoryWarningThreshold"]' ).val(0)
    $( '#' + @._formID ).find( '.lowInventoryWarningThreshold' ).slideToggle()
