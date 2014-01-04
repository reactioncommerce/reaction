Template.variantFormModal.defaultMetafield = ->
  isTemplate: true
  keyFieldAttributes: "disabled=\"disabled\""
  defaultValueFieldAttributes: "disabled=\"disabled\""
  key: "__KEY__"
  currentVariantIndex: window.getDynamicCurrentVariantIndex()

Template.variantFormModal.currentVariantIndex = ->
  return getSelectedVariantIndex()

Template.variantFormModal.variant = ->
  currentProduct = Products.findOne(Session.get("currentProductId"))
  (if _.isNumber(getSelectedVariantIndex()) then currentProduct.variants[getSelectedVariantIndex()] else getDefaultVariantData())

Template.variantFormModal.rendered = ->
  updateInventoryManagementFieldsVisibility()

Template.variantFormModal.events
  "change .variant-inventory-management": ->
    updateInventoryManagementFieldsVisibility()

  "click .add-embedded-document-link": (e, template) ->
    $template = $(e.target).closest(".form-group").prev(".form-group-template")
    html = $("<div />").append($template.clone()).html()
    html = html.replace(/__KEY__/g, template.findAll("." + $template.data("form-group-cls")).length - 1).replace("form-group-template", "")
    $template.before html
    _.defer ->
      $formGroup = $template.prev()
      $formGroup.find("input").prop "disabled", false
      $formGroup.find(".label-form-control").focus()

    # DOM manipulation defer
    e.preventDefault()

  "click .metafield-form-group .remove-embedded-document-button": (e, template) ->
    $formGroup = $(e.target).closest(".form-group")
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

    e.preventDefault()
    e.stopPropagation()

  "submit form": (e, template) ->
    e.preventDefault()
    currentProduct = Products.findOne(Session.get("currentProductId"))
    currentVariantIndex = getSelectedVariantIndex()
    oldVariant = currentProduct.variants[currentVariantIndex] or getDefaultVariantData()
    variant =
      _id: Random.id()
      inventoryPolicy: "deny"
      taxable: false
      requiresShipping: false

    form = template.find("form")
    $form = $(form)
    hash = $form.serializeHash()

    # TODO: simple-schema lacks default values, send him a PR
    _.extend variant, oldVariant, hash.variants[currentVariantIndex]

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
    currentProduct.variants[currentVariantIndex] = variant

    # TODO: simple-schema embedded document invalid key name message bug ("variants.$.metafields.0.value"), send him a PR
    validationContext = "variant"
    localValidationCallback = _.partial(validationCallback, $form, Products, validationContext, ->
      $(template.find(".modal")).modal "hide" # manual hide fix for Meteor reactivity
    , (name) ->
      name.replace /\$/, currentVariantIndex
    )
    Products.update currentProduct._id,
      $set:
        variants: currentProduct.variants
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

window.getDynamicCurrentVariantIndex = ->
  (if _.isNumber(getSelectedVariantIndex()) then getSelectedVariantIndex() else Products.findOne(Session.get("currentProductId")).variants.length)
