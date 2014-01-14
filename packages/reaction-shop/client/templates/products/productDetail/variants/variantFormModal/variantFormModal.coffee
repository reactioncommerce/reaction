Template.variantFormModal.helpers
  defaultMetafield: ->
    isTemplate: true
    keyFieldAttributes: "disabled=\"disabled\""
    defaultValueFieldAttributes: "disabled=\"disabled\""
    key: "__KEY__"
    currentVariantIndex: (currentProduct.get "index")
  currentVariantIndex: ->
    return (currentProduct.get "index")
  variant: ->
    (currentProduct.get "variant")
  rendered: ->
    updateInventoryManagementFieldsVisibility()

Template.variantFormModal.events
  "change .variant-inventory-management": ->
    updateInventoryManagementFieldsVisibility()

  "click .add-embedded-document-link": (event, template) ->
    $template = $(event.target).closest(".form-group").prev(".form-group-template")
    html = $("<div />").append($template.clone()).html()
    html = html.replace(/__KEY__/g, $template.findAll("." + $template.data("form-group-cls")).length - 1).replace("form-group-template", "")
    $template.before html
    _.defer ->
      $formGroup = template.prev()
      $formGroup.find("input").prop "disabled", false
      $formGroup.find(".label-form-control").focus()

    # DOM manipulation defer
    event.preventDefault()

  "click .metafield-form-group .remove-embedded-document-button": (event, template) ->
    $formGroup = $(event.target).closest(".form-group")
    cls = $formGroup.data("form-group-cls")
    $formGroup.remove()
    _.defer ->
      $(template.findAll("." + cls)).each (formGroupIndex, formGroup) ->
        $formGroup = $(formGroup)
        unless $formGroup.hasClass("form-group-template")
          $formGroup.find("input, select, textarea").each (inputIndex, input) ->
            $input = $(input)
            _.each [
              "id"
              "name"
            ], (attr) ->
              $input.attr attr, $input.attr(attr).replace(/(metafields[^\d]+)\d+/, "$1" + formGroupIndex)

    event.preventDefault()
    event.stopPropagation()

  "submit form": (event, template) ->
    thisProduct = this
    currentVariantIndex = (currentProduct.get "index")
    # don't set currentVariantIndex for new/cloned variants
    oldVariant = (currentProduct.get "product").variants[currentVariantIndex] or getDefaultVariantData()

    variant =
      _id: Random.id()
      inventoryPolicy: "deny"
      taxable: false
      requiresShipping: false

    #process metafields
    form = template.find("form")
    $form = $(form)
    hash = $form.serializeHash()
    # merge original, delete some fields that
    # we don't want in clone, and merge metafield
    # target,original, form fields
    _.extend variant, oldVariant, hash.variants[currentVariantIndex]
    # Map object created by serializeHash to schema required array
    for item,value of variant.metafields
      variant.metafields[value] = item

    # TODO: simple-schema optional decimal validation bug, send him a PR
    delete variant.compareAtPrice  unless variant.compareAtPrice
    delete variant.weight unless variant.weight
    delete variant.inventoryQuantity  unless variant.inventoryQuantity

    # TODO: simple-schema Boolean cleaning bug, send him a PR
    variant.taxable = !!variant.taxable
    variant.requiresShipping = !!variant.requiresShipping
    variant.updatedAt = new Date()

    variant = ProductVariantSchema.clean(variant)
    # TODO: server side method, or positional mongo statement to update only specific index
    thisProduct.variants[currentVariantIndex] = variant

    # TODO: simple-schema embedded document invalid key name message bug ("variants.$.metafields.0.value"), send him a PR
    # This uses scheme validation and returns any errors
    validationContext = "variant"
    localValidationCallback = _.partial(validationCallback, $form, Products, validationContext, ->
      $(template.find(".modal")).modal "hide" # manual hide fix for Meteor reactivity
    , (name) ->
      name.replace /\$/, currentVariantIndex
    )
    # Updating this new merge variants
    Products.update this._id,
      $set:
        variants:  thisProduct.variants
      ,
        validationContext: validationContext
      , localValidationCallback

validationCallback = ($form, collection, validationContext, successCallback, invalidKeyNameFixFunction, error, result) ->
  $form.find(".has-error").removeClass "has-error"
  $form.find(".error-block li").remove()
  if error
    invalidKeys = collection.namedContext(validationContext).invalidKeys()
    _.each invalidKeys, (invalidKey) ->
      name = invalidKeyNameFixFunction(invalidKey.name).replace(".", "\\[").replace(/\./g, "\\]\\[") + "\\]"
      $control = $form.find("*[name='" + name + "']")
      $formGroup = $control.closest(".form-group, .error-block-container")
      $errorBlock = undefined
      if $formGroup.length
        $formGroup.addClass "has-error"
        $errorBlock = $formGroup.find(".error-block")
        $errorBlock = $("<ul class=\"error-block\"></ul>").insertAfter($control)  unless $errorBlock.length
      else
        $errorBlock = $form.find(".error-block")
        # debugger
        $errorBlock = $("<ul class=\"error-block\"></ul>").prepend($form)  unless $errorBlock.length
      $errorBlock.first().append "<li>" + invalidKey.message + "</li>"

  else
    successCallback and successCallback()

updateInventoryManagementFieldsVisibility = ->
  $select = $(".variant-inventory-management")
  $(".variant-inventory-quantity, .variant-inventory-policy").closest(".form-group").toggle $select.val() is "reaction"

getDefaultVariantData = ->
  taxable: true
  requiresShipping: true
  createdAt: new Date()