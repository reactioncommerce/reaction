Template.variantFormModal.currentVariantIndex = function() {
  return Session.get("currentVariantIndex");
};

Template.variantFormModal.variant = function () {
  var currentProduct = Products.findOne(Session.get("currentProductId"));
  var currentVariantIndex = Session.get("currentVariantIndex");
  return currentProduct.variants[currentVariantIndex];
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
    // TODO: check for compliance with Shopify API
    // TODO: notably, inventory_policy should be "deny" if checkbox isn't selected
    // TODO: Make quantity "required" a dynamic attribute
    // TODO: convert data to proper types
    var form = template.find("form");
    var $form = $(form);
    // TODO: Normalize checkboxes... should be done by a library
    data = {
      inventoryPolicy: "deny",
      taxable: false,
      requiresShipping: false
    };
    // TODO: apply defaults & checkbox values
    var $set = $form.serializeHash();
    var currentProduct = Products.findOne(Session.get("currentProductId"));
    var validationContext = "variant";
    var localValidationCallback = _.partial(validationCallback, $form, Products, validationContext, function() {
      $(template.find('.modal')).modal("hide"); // manual hide fix for Meteor reactivity
    });
//    if (_.isNumber(Session.get("currentVariantIndex"))) {
      var variant = currentProduct.variants[Session.get("currentVariantIndex")];
//      $set["variants." + Session.get("currentVariantIndex")] = variant;
      Products.update(currentProduct._id, {$set: $set}, {validationContext: validationContext}, localValidationCallback);
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
        console.log("here");
        $errorBlock = $form.find(".error-block");
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
