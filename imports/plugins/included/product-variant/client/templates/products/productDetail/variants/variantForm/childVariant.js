import { Reaction, i18next } from "/client/api";
import { ReactionProduct } from "/lib/api";
import { Media } from "/lib/collections";
import { Icon } from "/imports/plugins/core/ui/client/components";

function productHandle() {
  const selectedProduct = ReactionProduct.selectedProduct();
  return selectedProduct.__published && selectedProduct.__published.handle || selectedProduct.handle;
}
/**
 * childVariantForm onRendered
 */
Template.onRendered(function () {
  this.autorun(() => {
    const selectedVariantId = Reaction.Router.getParam("variantId");

    $(`div.child-variant-collapse:not(#child-variant-form-${selectedVariantId})`).collapse("hide");
    $(`#child-variant-form-${selectedVariantId}`).collapse("show");
    $(`#option-child-variant-form-${selectedVariantId}`).focus();
  });
});

/**
 * childVariantForm helpers
 */

Template.childVariantForm.helpers({
  Icon() {
    return Icon;
  },
  childVariantFormId: function () {
    return "child-variant-form-" + this._id;
  },
  media: function () {
    const media = Media.find({
      "metadata.variantId": this._id
    }, {
      sort: {
        "metadata.priority": 1
      }
    });

    return media;
  },
  featuredMedia: function () {
    const media = Media.findOne({
      "metadata.variantId": this._id
    }, {
      sort: {
        "metadata.priority": 1
      }
    });

    if (media) {
      return [media];
    }

    return false;
  },
  handleFileUpload() {
    const ownerId = Meteor.userId();
    const productId = ReactionProduct.selectedProductId();
    const shopId = Reaction.getShopId();
    const currentData = Template.currentData();
    const variantId = currentData._id;

    return (files) => {
      for (const file of files) {
        file.metadata = {
          variantId,
          productId,
          shopId,
          ownerId
        };

        Media.insert(file);
      }
    };
  },
  active() {
    const variantId = ReactionProduct.selectedVariantId();

    if (variantId === this._id) {
      return "panel-active";
    }

    return "panel-default";
  }
});

/**
 * childVariantForm events
 */

Template.childVariantForm.events({
  "click .child-variant-form :input, click li": function (event, template) {
    const variantId = template.data._id;

    Reaction.Router.go("product", {
      handle: productHandle(),
      variantId: variantId
    });

    return ReactionProduct.setCurrentVariant(template.data._id);
  },
  "change .child-variant-input": function (event, template) {
    const variant = template.data;
    const value = Template.instance().$(event.currentTarget).val();
    const field = Template.instance().$(event.currentTarget).attr("name");

    Meteor.call("products/updateProductField", variant._id, field, value,
      error => {
        if (error) {
          throw new Meteor.Error("error updating variant", error);
        }
      });
    return ReactionProduct.setCurrentVariant(variant._id);
  },
  "click .js-child-variant-heading": function (event, instance) {
    const variantId = instance.data._id;

    Reaction.Router.go("product", {
      handle: productHandle(),
      variantId: variantId
    });
  },

  "click .js-remove-child-variant": function (event, instance) {
    event.stopPropagation();
    event.preventDefault();
    const title = instance.data.optionTitle || i18next.t("productDetailEdit.thisOption");

    Alerts.alert({
      title: i18next.t("productDetailEdit.archiveVariantConfirm", { title }),
      showCancelButton: true,
      confirmButtonText: "Archive"
    }, (isConfirm) => {
      if (isConfirm) {
        const id = instance.data._id;
        Meteor.call("products/deleteVariant", id, function (error, result) {
          // TODO why we have this on option remove?
          if (result && ReactionProduct.selectedVariantId() === id) {
            ReactionProduct.setCurrentVariant(null);
          }
        });
      }
    });
  },

  "click .js-restore-child-variant": function (event, instance) {
    event.stopPropagation();
    event.preventDefault();
    const title = instance.data.optionTitle || i18next.t("productDetailEdit.thisOption");

    Alerts.alert({
      title: i18next.t("productDetailEdit.restoreVariantConfirm", { title }),
      showCancelButton: true,
      confirmButtonText: "Restore"
    }, (isConfirm) => {
      if (isConfirm) {
        const id = instance.data._id;
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
  }
});
