Template.variantFormModal.defaultMetafield = function () {
  return {
    isTemplate: true,
    keyFieldAttributes: "disabled=\"disabled\"",
    defaultValueFieldAttributes: "disabled=\"disabled\"",
    key: "__KEY__",
    currentVariantIndex: window.getDynamicCurrentVariantIndex()
  }
};

Template.variantFormModal.currentVariantIndex = function () {
  return window.getDynamicCurrentVariantIndex();
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
  "click .add-embedded-document-link": function (e, template) {
    var $template = $(e.target).closest(".form-group").prev(".form-group-template");
    var html = $("<div />").append($template.clone()).html();
    html = html.replace(/__KEY__/g, template.findAll("." + $template.data("form-group-cls")).length - 1).replace("form-group-template", "");
    $template.before(html);
    _.defer(function () {
      var $formGroup = $template.prev();
      $formGroup.find("input").prop("disabled", false);
      $formGroup.find(".label-form-control").focus();
    }); // DOM manipulation defer
    e.preventDefault();
  },
  "click .metafield-form-group .remove-embedded-document-button": function (e, template) {
    var $formGroup = $(e.target).closest(".form-group");
    var cls = $formGroup.data("form-group-cls");
    $formGroup.remove();
    _.defer(function () {
      $(template.findAll("." + cls)).each(function (formGroupIndex, formGroup) {
        var $formGroup = $(formGroup);
        if (!$formGroup.hasClass("form-group-template")) {
          $formGroup.find("input, select, textarea").each(function (inputIndex, input) {
            var $input = $(input);
            _.each(["id", "name"], function (attr) {
              $input.attr(attr, $input.attr(attr).replace(/(metafields[^\d]+)\d+/, "$1" + formGroupIndex));
            });
          });
        }
      });
    });
    e.preventDefault();
    e.stopPropagation();
  },
  "submit form": function (e, template) {
    e.preventDefault();
    var currentProduct = Products.findOne(Session.get("currentProductId"));
    var currentVariantIndex = window.getDynamicCurrentVariantIndex();
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
    // TODO: simple-schema embedded document invalid key name message bug ("variants.$.metafields.0.value"), send him a PR
    var localValidationCallback = _.partial(validationCallback, $form, Products, validationContext, function () {
      $(template.find('.modal')).modal("hide"); // manual hide fix for Meteor reactivity
    }, function (name) {
      return name.replace(/\$/, currentVariantIndex);
    });
    Products.update(currentProduct._id, {$set: {variants: currentProduct.variants}}, {validationContext: validationContext}, localValidationCallback);
  }
});

var validationCallback = function ($form, collection, validationContext, successCallback, invalidKeyNameFixFunction, error, result) {
  $form.find(".has-error").removeClass("has-error");
  $form.find(".error-block li").remove();
  if (error) {
    var invalidKeys = collection.namedContext(validationContext).invalidKeys();
    _.each(invalidKeys, function (invalidKey) {
      var name = invalidKeyNameFixFunction(invalidKey.name).replace(".", "\\[").replace(/\./g, "\\]\\[") + "\\]";
      var $control = $form.find("*[name='" + name + "']");
      var $formGroup = $control.closest(".form-group, .error-block-container");
      var $errorBlock;
      if ($formGroup.length) {
        $formGroup.addClass("has-error");
        $errorBlock = $formGroup.find(".error-block");
        if (!$errorBlock.length) {
          $errorBlock = $('<ul class="error-block"></ul>').insertAfter($control);
        }
      } else {
        $errorBlock = $form.find(".error-block");
        debugger;
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


var getDefaultVariantData = function () {
  return {
    taxable: true,
    requiresShipping: true,
    createdAt: new Date()
  }
};

window.getDynamicCurrentVariantIndex = function () {
  var currentVariantIndex = Session.get("currentVariantIndex");
  return _.isNumber(currentVariantIndex) ? currentVariantIndex : Products.findOne(Session.get("currentProductId")).variants.length;
};
