Template.variantFormModal.currentVariantIndex = function () {
  return getDynamicCurrentVariantIndex();
};

Template.variantFormModal.variant = function () {
  var currentProduct = Products.findOne(Session.get("currentProductId"));
  var currentVariantIndex = Session.get("currentVariantIndex");
  return _.isNumber(currentVariantIndex) ? currentProduct.variants[currentVariantIndex] : getDefaultVariantData();
};

Template.variantFormModal.rendered = function () {
  updateInventoryManagementFieldsVisibility();
};

Template.variantFormModal.events({
  "change .variant-inventory-management": function () {
    updateInventoryManagementFieldsVisibility()
  },
  "submit form": function (e, template) {
    e.preventDefault();
    var currentProduct = Products.findOne(Session.get("currentProductId"));
    var currentVariantIndex = getDynamicCurrentVariantIndex();
    var oldVariant = currentProduct.variants[currentVariantIndex] || getDefaultVariantData();
    var variant = {
      inventoryPolicy: "deny",
      taxable: false,
      requiresShipping: false
    };
    var form = template.find("form");
    var $form = $(form);
    var hash = $form.serializeHash();
    // TODO: simple-schema lacks default values, send him a PR
    _.extend(variant, oldVariant, hash.variants[currentVariantIndex]);
    // TODO: simple-schema optional decimal validation bug, send him a PR
    if (!variant.compareAtPrice) delete variant.compareAtPrice;
    if (!variant.grams) delete variant.grams;
    if (!variant.inventoryQuantity) delete variant.inventoryQuantity;
    // TODO: simple-schema Boolean cleaning bug, send him a PR
    variant.taxable = !!variant.taxable;
    variant.requiresShipping = !!variant.requiresShipping;
    variant.updatedAt = new Date();
    variant = ProductVariantSchema.clean(variant);
    currentProduct.variants[currentVariantIndex] = variant;
    var validationContext = "variant";
    var localValidationCallback = _.partial(validationCallback, $form, Products, validationContext, function () {
      $(template.find('.modal')).modal("hide"); // manual hide fix for Meteor reactivity
    });
    Products.update(currentProduct._id, {$set: {variants: currentProduct.variants}}, {validationContext: validationContext}, localValidationCallback);
  }
});

var validationCallback = function ($form, collection, validationContext, successCallback, error, result) {
  $form.find(".has-error").removeClass("has-error");
  $form.find(".error-block li").remove();
  if (error) {
    var invalidKeys = collection.namedContext(validationContext).invalidKeys();
    _.each(invalidKeys, function (invalidKey) {
      var name = invalidKey.name.replace(".", "\\[").replace(/\./g, "\\]\\[") + "\\]";
      var $control = $form.find("*[name='" + name + "']");
      var $formGroup = $control.closest(".form-group");
      var $errorBlock;
      if ($formGroup.length) {
        $formGroup.addClass("has-error");
        $errorBlock = $formGroup.find(".error-block");
        if (!$errorBlock.length) {
          $errorBlock = $('<ul class="error-block"></ul>').insertAfter($control);
        }
      } else {
        $errorBlock = $form.find(".error-block");
        if (!$errorBlock.length) {
          $errorBlock = $('<ul class="error-block"></ul>').prepend($form);
        }
      }
      $errorBlock.first().append("<li>" + invalidKey.message + "</li>");
    });
  } else {
    successCallback && successCallback();
  }
};

var updateInventoryManagementFieldsVisibility = function () {
  var $select = $(".variant-inventory-management");
  $(".variant-inventory-quantity, .variant-inventory-policy").closest(".form-group").toggle($select.val() == "reaction");
};

var getDynamicCurrentVariantIndex = function () {
  var currentVariantIndex = Session.get("currentVariantIndex");
  return _.isNumber(currentVariantIndex) ? currentVariantIndex : Products.findOne(Session.get("currentProductId")).variants.length;
};

var getDefaultVariantData = function() {
  return {
    taxable: true,
    requiresShipping: true,
    createdAt: new Date()
  }
};
