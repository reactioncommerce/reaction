

Template.variantForm.helpers
  variantFormSchema: ->
    variantSchema = new AutoForm ProductVariantSchema
    variantSchema
  data: ->
    # # giant f'ing kludge to workaround autoform embedded schema array updating
    # metafieldArray = new Array
    # value = 0
    # if @.metafields
    #   for item,value in @.metafields
    #     metafieldArray.push {
    #       index: value
    #       key: "metafields."+value+".key"
    #       value: "metafields."+value+".value"
    #     }

    # value = value + 1
    # metafieldArray.push {
    #   index: value
    #   key: "metafields."+value+".key"
    #   value: "metafields."+value+".value"
    # }
    # #metafieldArray.push {index: value} if metafieldArray?
    # @.metafieldsIndexed = metafieldArray
    # console.log @
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
    console.log "dependancy changed"
    currentProduct.changed "product"
  # "change input": (event, template) ->
  #   $("#"+this._formID+" button").trigger("click")