import { Reaction, i18next, Logger } from "/client/api";
import { ReactionProduct } from "/lib/api";
import { Meteor } from "meteor/meteor";
import { Session } from "meteor/session";
import { Template } from "meteor/templating";
import { Product } from "/lib/collections/schemas";
import { TextArea, TextBox, Select } from "./editors";

function i18nPlaceholder(field) {
  const i18nKey = `productDetailEdit.${field}`;
  if (i18next.t(i18nKey) === i18nKey) {
    Logger.info(`returning empty placeholder productDetailEdit: ${i18nKey} no i18n key found.`);
  } else {
    return i18next.t(i18nKey);
  }

  return "";
}

function processChange({ name, value }) {
  const productId = ReactionProduct.selectedProductId();

  Meteor.call("products/updateProductField", productId, name, value,
    (error, result) => {
      if (error) {
        return Alerts.toast(error.reason, "error", {
          i18nKey: "productDetail.errorMsg"
        });
      }

      if (result) {
        // redirect to new url on title change
        if (name === "title") {
          Meteor.call("products/setHandle", productId,
            (err, res) => {
              if (err) {
                Alerts.toast(err.reason, "error", {
                  i18nKey: "productDetail.errorMsg"
                });
              }
              if (res) {
                Reaction.Router.go("product", {
                  handle: res
                });
              }
            }
          );
        }
      }});
  return Session.set("editing-" + name, false);
}

function setupEditor({ component, field, value, ...additionalProps }) {
  return {
    className: `form-control ${field}-edit-input`,
    name: field,
    onChange: processChange,
    placeholder: i18nPlaceholder(field),
    value,
    component,
    ...additionalProps
  };
}

Template.productDetailEdit.onCreated(() => {
  const t = Template.instance();

  if (t.data.type) {
    // respect explicit field type
    return;
  }

  // If not given explicit type to use in the editor
  // look into Product schema to figure out the most
  // appropriate editor to use
  const fieldDefinition = Product.getDefinition(t.data.field);

  if (fieldDefinition && fieldDefinition.allowedValues) {
    t.type = "select";
    t.allowedValues = fieldDefinition.allowedValues;
  }
});

/**
 * productDetailEdit helpers
 */

Template.productDetailEdit.helpers({
  TextArea() {
    return setupEditor({
      component: TextArea,
      field: this.field,
      value: this.value
    });
  },

  TextBox() {
    return setupEditor({
      component: TextBox,
      field: this.field,
      value: this.value
    });
  },

  Select() {
    return setupEditor({
      component: Select,
      field: this.field,
      value: this.value,
      options: Template.instance().allowedValues
    });
  },

  type() {
    const t = Template.instance();
    return t.type || t.data.type;
  }
});

/**
 * productDetailField events
 */

Template.productDetailField.events({
  "click .product-detail-field": function () {
    if (Reaction.hasPermission("createProduct")) {
      const fieldClass = "editing-" + this.field;
      Session.set(fieldClass, true);
      // Tracker.flush();
      return $(`.${this.field}-edit-input`).focus();
    }
  }
});
