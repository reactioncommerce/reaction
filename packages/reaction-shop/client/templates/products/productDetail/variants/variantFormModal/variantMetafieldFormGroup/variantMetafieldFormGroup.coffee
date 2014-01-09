Template.variantMetafieldFormGroup.currentVariantIndex = ->
  window.getDynamicCurrentVariantIndex()

Template.variantMetafieldFormGroup.defaultValueFieldName = ->
  return "variants." + this.currentVariantIndex + ".metafields." + this.key + ".value";
