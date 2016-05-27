const Media = ReactionCore.Collections.Media;

/**
 * childVariantForm helpers
 */

Template.childVariantForm.helpers({
  childVariantFormId: function () {
    return "child-variant-form-" + this._id;
  },
  media: function () {
    const media = ReactionCore.Collections.Media.findOne({
      "metadata.variantId": this._id
    }, { sort: { uploadedAt: 1 } });

    return media instanceof FS.File ? media : false;
  },
  handleFileUpload() {
    const ownerId = Meteor.userId();
    const productId = ReactionProduct.selectedProductId();
    const shopId = ReactionCore.getShopId();
    const currentData = Template.currentData();
    const variantId = currentData._id;

    return (files) => {
      for (let file of files) {
        file.metadata = {
          variantId,
          productId,
          shopId,
          ownerId
        };

        Media.insert(file);
      }
    };
  }
});

/**
 * childVariantForm events
 */

Template.childVariantForm.events({
  "click .child-variant-form :input, click li": function (event, template) {
    return ReactionProduct.setCurrentVariant(template.data._id);
  },
  "change .child-variant-form :input": function (event, template) {
    const variant = template.data;
    const value = $(event.currentTarget).val();
    const field = $(event.currentTarget).attr("name");

    Meteor.call("products/updateProductField", variant._id, field, value,
      error => {
        if (error) {
          throw new Meteor.Error("error updating variant", error);
        }
      });
    return ReactionProduct.setCurrentVariant(variant._id);
  },
  "click #remove-child-variant": function (event) {
    event.stopPropagation();
    event.preventDefault();
    const title = this.optionTitle || i18next.t("productDetailEdit.thisOption");
    if (confirm(i18next.t("productDetailEdit.removeVariantConfirm", { title }))) {
      const id = this._id;
      return Meteor.call("products/deleteVariant", id, function (error, result) {
        // TODO why we have this on option remove?
        if (result && ReactionProduct.selectedVariantId() === id) {
          return ReactionProduct.setCurrentVariant(null);
        }
      });
    }
  }
});
