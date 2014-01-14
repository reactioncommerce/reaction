Template.variantMetafieldFormGroup.currentVariantIndex = ->
  (currentProduct.get "index")

Template.variantMetafieldFormGroup.defaultValueFieldName = ->
  return "variants." + (currentProduct.get "index") + ".metafields." + this.key + ".value";
