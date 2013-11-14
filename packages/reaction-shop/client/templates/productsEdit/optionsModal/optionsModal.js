Template.optionsModal.default = {
  cls: "form-group-template",
  key: ""
};

Template.optionsModal.options = function () {
  var options = [];
  _.each(this.options, function(option, key) {
    options.push({
      object: option,
      key: key,
      nameFieldName: "options."+key+".name",
      defaultValueFieldName: "options."+key+".defaultValue"
    })
  });
  return options;
};

Template.optionsModal.rendered = function () {

};

Template.optionsModal.events({
  "click .add-option-link": function (e, template) {
    var $template = $(e.target).closest(".row").prev(".form-group-template");
    var html = $("<div />").append($template.clone()).html();
    html = html.replace("__INDEX__", template.findAll(".option-form-group").length, "g").replace("form-group-template", "option-form-group");
    $template.before(html);
    setTimeout(function() {$template.prev().find('.label-form-control').focus()}, 1); // DOM manipulation defer
    e.preventDefault();
  },
  "click .remove-button": function (e, template) {
    $(e.target).closest(".form-group").remove();
  },
  "click .close-button": function (e, template) {
//    template.find("form").reset();
  },
  "click .save-button": function (e, template) {
    // TODO: check for compliance with Shopify API
    // TODO: notably, inventory_policy should be "deny" if checkbox isn"t selected
    // TODO: Make quantity "required" a dynamic attribute
    // TODO: convert data to proper types
    // TODO: Simplify the true : false; in helper
    var form = template.find("form");
    var $form = $(form);
    data = {};
    $.each($form.serializeArray(), function () {
      data[this.name] = this.value;
    });
    debugger;
    var currentProduct = Products.findOne(Session.get("currentProductId"));
    if (_.isNumber(Session.get("currentVariantIndex"))) {
      var variant = currentProduct.variants[Session.get("currentVariantIndex")];
      $.extend(true, variant, data);
      var $set = {};
      $set["variants." + Session.get("currentVariantIndex")] = variant;
      Products.update(currentProduct._id, {$set: $set});
    } else {
      Products.update(currentProduct._id, {$push: {variants: data}});
    }
    form.reset();
    $(template.find('.modal')).modal("hide"); // manual hide fix for Meteor reactivity
  }
});
