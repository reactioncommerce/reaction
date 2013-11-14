Template.optionsModal.default = {
  cls: "form-group-template",
  key: "__KEY__",
  nameFieldAttributes: "disabled=\"disabled\"",
  defaultValueFieldAttributes: "disabled=\"disabled\""
};

Template.optionsModal.rendered = function () {

};

Template.optionsModal.events({
  "click .add-option-link": function (e, template) {
    var $template = $(e.target).closest(".row").prev(".form-group-template");
    var html = $("<div />").append($template.clone()).html();
    html = html.replace(/__KEY__/g, template.findAll(".form-group").length-1).replace("form-group-template", "option-form-group");
    $template.before(html);
    setTimeout(function() {
      var $formGroup = $template.prev();
      $formGroup.find("input").prop("disabled", false);
      $formGroup.find(".label-form-control").focus();
    }, 1); // DOM manipulation defer
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
    data = $form.serializeHash();
    console.log(data);
    Products.update(Session.get("currentProductId"), {$set: data}, {validationContext: "options"}, function(error, result) {
      console.log(Products.namedContext("options").invalidKeys())
    });
    $(template.find(".modal")).modal("hide"); // manual hide fix for Meteor reactivity
  }
});
