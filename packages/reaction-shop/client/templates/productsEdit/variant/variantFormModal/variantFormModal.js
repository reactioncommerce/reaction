Template.variantFormModal.currentVariantIndex = function() {
  return Session.get("currentVariantIndex");
};

Template.variantFormModal.variant = function () {
  var currentProduct = Products.findOne(Session.get("currentProductId"));
  var currentVariantIndex = Session.get("currentVariantIndex");
  return typeof currentVariantIndex === "undefined"? null : currentProduct.variants[currentVariantIndex];
};

Template.variantFormModal.rendered = function () {
  updateInventoryManagementFieldsVisibility();
};

Template.variantFormModal.events({
  "change .variant-inventory-management": function () {
    updateInventoryManagementFieldsVisibility()
  },
  "click .close-button": function (e, template) {
//    template.find("form").reset();
  },
  "submit form": function (e, template) {
    var currentProduct = Products.findOne(Session.get("currentProductId"));
    var currentVariantIndex = Session.get("currentVariantIndex");
    var oldVariant = currentProduct.variants[currentVariantIndex];
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
    if (!variant.compareAtPrice) {
      delete variant.compareAtPrice;
    }
    // TODO: simple-schema Boolean cleaning bug, send him a PR
    variant.taxable = !!variant.taxable;
    variant.requiresShipping = !!variant.requiresShipping;
    variant.updatedAt = new Date();
    variant = ProductVariantSchema.clean(variant);
    currentProduct.variants[currentVariantIndex] = variant;
    var validationContext = "variant";
    var localValidationCallback = _.partial(validationCallback, $form, Products, validationContext, function() {
      $(template.find('.modal')).modal("hide"); // manual hide fix for Meteor reactivity
    });
//    if (_.isNumber(Session.get("currentVariantIndex"))) {
//      hash["variants." + Session.get("currentVariantIndex")] = variant;
      Products.update(currentProduct._id, {$set: {variants: currentProduct.variants}}, {validationContext: validationContext}, localValidationCallback);
//    } else {
//      Products.update(currentProduct._id, {$push: {variants: data}}, {validationContext: validationContext}, localValidationCallback);
//    }
  }
});

var validationCallback = function($form, collection, validationContext, successCallback, error, result) {
  $form.find(".has-error").removeClass("has-error");
  $form.find(".error-block li").remove();
  if (error) {
    var invalidKeys = collection.namedContext(validationContext).invalidKeys();
    _.each(invalidKeys, function(invalidKey) {
      var id = invalidKey.name.replace(/\./g, "-");
      var $formGroup = $form.find("#" + id).closest(".form-group");
      var $errorBlock;
      if ($formGroup.length) {
        $errorBlock = $formGroup.find(".error-block");
        $formGroup.addClass("has-error");
      } else {
        $errorBlock = $form.find(".error-block");
      }
      if (!$errorBlock.length) {
        throw new Exception("Error block for field "+invalidKey.name);
      }
      $errorBlock.first().append("<li>"+invalidKey.message+"</li>");
    });
  } else {
    successCallback && successCallback();
  }
};

var updateInventoryManagementFieldsVisibility = function () {
  var $select = $(".variant-inventory-management");
  $(".variant-inventory-quantity, .variant-inventory-policy").closest(".form-group").toggle($select.val() == "reaction");
};
