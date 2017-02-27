import { Meteor } from "meteor/meteor";
import { Session } from "meteor/session";
import { Template } from "meteor/templating";
import { Reaction, i18next } from "/client/api";
import { ReactionProduct } from "/lib/api";
import { applyProductRevision } from "/lib/api/products";
import { Packages, Products } from "/lib/collections";
import { ReactiveDict } from "meteor/reactive-dict";
import { TaxCodes } from "/imports/plugins/core/taxes/lib/collections";

Template.variantForm.onCreated(function () {
  this.state = new ReactiveDict();
  this.state.set("taxCodes", []);

  this.autorun(() => {
    // subscribe to TaxCodes
    Meteor.subscribe("TaxCodes");

    const productHandle = Reaction.Router.getParam("handle");

    if (!productHandle) {
      Reaction.clearActionView();
    }
  });

  this.getVariant = (variant) => {
    const product = Products.findOne(variant._id);
    return applyProductRevision(product);
  };
});

/**
 * variantForm helpers
 */

Template.variantForm.helpers({
  variant() {
    const instance = Template.instance();
    return instance.getVariant(instance.data);
  },
  variantDetails: function () {
    if (this.ancestors.length === 1) {
      return Template.parentVariantForm;
    }
    return Template.childVariantForm;
  },
  childVariants: function () {
    const _id = this._id;
    const variants = ReactionProduct.getVariants();
    const childVariants = [];
    variants.map(variant => {
      if (~variant.ancestors.indexOf(_id) && variant.type !== "inventory") {
        childVariants.push(variant);
      }
    });
    return childVariants;
  },
  hasChildVariants: function () {
    return ReactionProduct.checkChildVariants(this._id) > 0;
  },
  variantFormId: function () {
    return "variant-form-" + this._id;
  },
  variantFormVisible: function () {
    if (!Session.equals("variant-form-" + this._id, true)) {
      return "hidden";
    }
  },
  displayInventoryManagement: function () {
    if (this.inventoryManagement !== true) {
      return "display:none;";
    }
  },
  displayLowInventoryWarning: function () {
    if (this.inventoryManagement !== true) {
      return "display:none;";
    }
  },
  displayTaxCodes: function () {
    if (this.taxable !== true) {
      return "display:none;";
    }
  },
  removeVariant(variant) {
    return () => {
      return () => {
        const title = variant.title || i18next.t("productDetailEdit.thisVariant");

        Alerts.alert({
          title: i18next.t("productDetailEdit.archiveVariantConfirm", { title }),
          showCancelButton: true,
          confirmButtonText: "Archive"
        }, (isConfirm) => {
          if (isConfirm) {
            const id = variant._id;
            Meteor.call("products/deleteVariant", id, function (error, result) {
              if (result && ReactionProduct.selectedVariantId() === id) {
                return ReactionProduct.setCurrentVariant(null);
              }
            });
          }
        });
      };
    };
  },
  restoreVariant(variant) {
    return () => {
      return () => {
        const title = variant.title || i18next.t("productDetailEdit.thisVariant");

        Alerts.alert({
          title: i18next.t("productDetailEdit.restoreVariantConfirm", { title }),
          showCancelButton: true,
          confirmButtonText: "Restore"
        }, (isConfirm) => {
          if (isConfirm) {
            const id = variant._id;
            Meteor.call("products/updateProductField", id, "isDeleted", false, (error) => {
              if (error) {
                Alerts.alert({
                  text: i18next.t("productDetailEdit.restoreVariantFail", { title }),
                  confirmButtonText: i18next.t("app.close", { defaultValue: "Close" })
                });
              }
            });
          }
        });
      };
    };
  },
  listTaxCodes: function () {
    const instance = Template.instance();
    const shopId = Reaction.getShopId();

    const provider = Packages.findOne({
      "shopId": shopId,
      "registry.provides": "taxCodes",
      "$where": function () {
        const providerName = this.name.split("-")[1];
        return this.settings[providerName].enabled;
      }
    });

    if (provider) {
      if (Meteor.subscribe("TaxCodes").ready() && TaxCodes.find({}).count() === 0) {
        Meteor.call(provider.settings.taxCodes.getTaxCodeMethod, (error, result) => {
          result.forEach(function (code) {
            Meteor.call("taxes/insertTaxCodes", shopId, code, provider.name, (err) => {
              if (err) {
                throw new Meteor.Error("Error populating TaxCodes collection", err);
              }
              return;
            });
          });
        });
        Meteor.call("taxes/fetchTaxCodes", shopId, provider.name, (err, res) => {
          if (err) {
            throw new Meteor.Error("Error fetching records", err);
          } else {
            instance.state.set("taxCodes", res);
          }
        });
      } else {
        Meteor.call("taxes/fetchTaxCodes", shopId, provider.name, (err, res) => {
          if (err) {
            throw new Meteor.Error("Error fetching records", err);
          } else {
            instance.state.set("taxCodes", res);
          }
        });
      }
    } else {
      return false;
    }
    return instance.state.get("taxCodes");
  }
});

/**
 * variantForm events
 */

Template.variantForm.events({
  "change form :input": function (event, template) {
    const field = Template.instance().$(event.currentTarget).attr("name");
    //
    // this should really move into a method
    //
    if (field === "taxable" || field === "inventoryManagement" || field === "inventoryPolicy") {
      const value = Template.instance().$(event.currentTarget).prop("checked");
      if (ReactionProduct.checkChildVariants(template.data._id) > 0) {
        const childVariants = ReactionProduct.getVariants(template.data._id);
        for (const child of childVariants) {
          Meteor.call("products/updateProductField", child._id, field, value,
            error => {
              if (error) {
                throw new Meteor.Error("error updating variant", error);
              }
            });
        }
      }
    }
    // template.$(formId).submit();
    // ReactionProduct.setCurrentVariant(template.data._id);
  },
  "click .btn-child-variant-form": function (event, template) {
    event.stopPropagation();
    event.preventDefault();
    const productId = ReactionProduct.selectedProductId();

    if (!productId) {
      return;
    }

    Meteor.call("products/createVariant", template.data._id, function (error, result) {
      if (error) {
        Alerts.alert({
          text: i18next.t("productDetailEdit.addVariantFail", { title: template.data.title }),
          confirmButtonText: i18next.t("app.close", { defaultValue: "Close" })
        });
      } else if (result) {
        const newVariantId = result;
        const selectedProduct = ReactionProduct.selectedProduct();
        ReactionProduct.setCurrentVariant(newVariantId);
        Session.set("variant-form-" + newVariantId, true);

        Reaction.Router.go("product", {
          handle: selectedProduct.handle,
          variantId: newVariantId
        });
      }
    });
  },
  "click .btn-clone-variant": function (event, template) {
    event.stopPropagation();
    event.preventDefault();
    const productId = ReactionProduct.selectedProductId();
    if (!productId) {
      return;
    }
    Meteor.call("products/cloneVariant", productId, template.data._id,
      function (error, result) {
        if (error) {
          Alerts.alert({
            text: i18next.t("productDetailEdit.cloneVariantFail", { title: template.data.title }),
            confirmButtonText: i18next.t("app.close", { defaultValue: "Close" })
          });
        } else if (result) {
          const variantId = result[0];

          ReactionProduct.setCurrentVariant(variantId);
          Session.set("variant-form-" + variantId, true);
        }
      });
  }
});
