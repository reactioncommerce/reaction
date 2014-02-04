Template.variantForm.helpers
  variantFormSchema: ->
    variantSchema = new AutoForm ProductVariantSchema
    variantSchema
  data: ->
    @
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
    if @._doc.metafields
      for item,value in @._doc.metafields
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

Template.variantForm.events
  "submit form": (event,template) ->
    currentProduct.changed "product"
  # "change input": (event, template) ->
  #   $("#"+this._formID+" button").trigger("click")