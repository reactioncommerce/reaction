import autosize from "autosize";
import i18next from "i18next";
import { Reaction } from "/client/modules/core";
import Logger from "/client/modules/logger";
import { ReactionProduct } from "/lib/api";
import { ReactionRouter } from "/client/modules/router";

/**
 * productDetailEdit helpers
 */

Template.productDetailEdit.helpers({
  i18nPlaceholder: function () {
    let i18nKey = `productDetailEdit.${this.field}`;
    if (i18next.t(i18nKey) === i18nKey) {
      Logger.info(`returning empty placeholder productDetailEdit: ${i18nKey} no i18n key found.`);
    } else {
      return i18next.t(i18nKey);
    }
  }
});

/**
 * productDetailEdit events
 */

Template.productDetailEdit.events({
  "change input,textarea": function (event) {
    const self = this;
    const productId = ReactionProduct.selectedProductId();
    Meteor.call("products/updateProductField", productId, self.field,
      $(event.currentTarget).val(),
      (error, result) => {
        if (error) {
          return Alerts.inline(error.reason, "error", {
            placement: "productManagement",
            i18nKey: "productDetail.errorMsg",
            id: self._id
          });
        }
        if (result) {
          // redirect to new url on title change
          if (self.field === "title") {
            Meteor.call("products/setHandle", productId,
              (err, res) => {
                if (err) {
                  Alerts.inline(err.reason, "error", {
                    placement: "productManagement",
                    i18nKey: "productDetail.errorMsg",
                    id: self._id
                  });
                }
                if (res) {
                  ReactionRouter.go("product", {
                    handle: res
                  });
                }
              }
            );
          }
          // animate updated field
          // TODO this needs to be moved into a component
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
    if (Reaction.hasPermission("createProduct")) {
      let fieldClass = "editing-" + this.field;
      Session.set(fieldClass, true);
      // Tracker.flush();
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
