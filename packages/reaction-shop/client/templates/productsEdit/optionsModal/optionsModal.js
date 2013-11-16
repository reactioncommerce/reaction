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
    _.defer(function() {
      var $formGroup = $template.prev();
      $formGroup.find("input").prop("disabled", false);
      $formGroup.find(".label-form-control").focus();
    }); // DOM manipulation defer
    e.preventDefault();
  },
  "click .remove-button": function (e, template) {
    $(e.target).closest(".form-group").remove();
    $(template.find("form")).find("input").each(function(index, input) {
      var $input = $(input);
      var embeddedDocumentIndex = Math.floor(index / 2);
      _.each(["id", "name"], function(attr) {
        $input.attr(attr, $input.attr(attr).replace(/\d+/, embeddedDocumentIndex));
      });
    });
    e.preventDefault();
    e.stopPropagation();
  },
  "click .close-button": function (e, template) {
//    template.find("form").reset();
  },
  "submit form": function (e, template) {
    var form = template.find("form");
    var $form = $(form);
    var data = $form.serializeHash();
    Products.update(Session.get("currentProductId"), {$set: data}, {validationContext: "options"}, function(error, result) {
      $form.find(".has-error").removeClass("has-error");
      $form.find(".error-block li").remove();
      if (error) {
        var invalidKeys = Products.namedContext("options").invalidKeys();
        _.each(invalidKeys, function(invalidKey) {
          var id = invalidKey.name.replace(/\./g, "-");
          var $formGroup = $form.find("#" + id).closest(".form-group");
          var $errorBlock;
          if ($formGroup) {
            $errorBlock = $formGroup.find(".error-block");
            $formGroup.addClass("has-error");
          } else {
            $errorBlock = $form.find(".error-block");
          }
          $errorBlock.append("<li>"+invalidKey.message+"</li>");
        });
      } else {
        $(template.find(".modal")).modal("hide"); // manual hide fix for Meteor reactivity
      }
    });
  }
});
