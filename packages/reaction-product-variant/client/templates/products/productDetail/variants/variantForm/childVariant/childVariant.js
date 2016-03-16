/**
 * childVariantForm helpers
 */

Template.childVariantForm.helpers({
  childVariantFormId: function () {
    return "child-variant-form-" + this._id;
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
    let optionTitle = this.optionTitle || "this option";
    if (confirm("Are you sure you want to delete " + optionTitle)) {
      let id = this._id;
      return Meteor.call("products/deleteVariant", id, function (error,
        result) {
        if (result && ReactionProduct.selectedVariantId() === id) {
          return ReactionProduct.setCurrentVariant(null);
        }
      });
    }
  }
});
