/**
* productDetailEdit helpers
*/

Template.productDetailEdit.helpers({
  i18nPlaceholder: function() {
    var i18n_key;
    i18nextDep.depend();
    i18n_key = "productDetailEdit." + this.field;
    if (i18n.t(i18n_key) === i18n_key) {
      console.info("returning empty placeholder,'productDetailEdit:" + i18n_key + "' no i18n key found.");
    } else {
      return i18n.t(i18n_key);
    }
  }
});

/**
* productDetailEdit events
*/

Template.productDetailEdit.events({
  "change input,textarea": function(event, template) {
    Meteor.call("updateProductField", selectedProductId(), this.field, $(event.currentTarget).val(), function(error, results) {
      if (results) {
        return $(event.currentTarget).animate({
          backgroundColor: "#e2f2e2"
        }).animate({
          backgroundColor: "#fff"
        });
      }
    });
    if (this.type === "textarea") {
      autosize($(event.currentTarget));
    }
    return Session.set("editing-" + this.field, false);
  }
});

/**
* productDetailField events
*/

Template.productDetailField.events({
  "click .product-detail-field": function(event, template) {
    var fieldClass;
    if (ReactionCore.hasOwnerAccess()) {
      fieldClass = "editing-" + this.field;
      Session.set(fieldClass, true);
      Tracker.flush();
      return $('.' + this.field + '-edit-input').focus();
    }
  }
});

/**
* productDetailEdit onRendered
*/

Template.productDetailEdit.onRendered(function() {
  return autosize($('textarea'));
});
