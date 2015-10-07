/**
 * productDetailEdit helpers
 */

Template.productDetailEdit.helpers({
  i18nPlaceholder: function () {
    i18nextDep.depend();
    let i18nKey = `productDetailEdit.${this.field}`;
    if (i18n.t(i18nKey) === i18nKey) {
      ReactionCore.Log.info(`returning empty placeholder productDetailEdit: ${i18nKey} no i18n key found.`);
    } else {
      return i18n.t(i18nKey);
    }
  }
});

/**
 * productDetailEdit events
 */

Template.productDetailEdit.events({
  "change input,textarea": function (event) {
    Meteor.call("products/updateProductField", selectedProductId(), this.field,
      $(event.currentTarget).val(),
      function (error, results) {
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
  "click .product-detail-field": function () {
    if (ReactionCore.hasOwnerAccess()) {
      let fieldClass = "editing-" + this.field;
      Session.set(fieldClass, true);
      Tracker.flush();
      return $(`.${this.field}-edit-input`).focus();
    }
  }
});

/**
 * productDetailEdit onRendered
 */

Template.productDetailEdit.onRendered(function () {
  return autosize($("textarea"));
});
