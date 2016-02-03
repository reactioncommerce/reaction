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
    return setCurrentVariant(template.data._id);
  },
  "change .child-variant-form :input": function (event, template) {
    let variant = template.data;
    let value = $(event.currentTarget).val();
    let field = $(event.currentTarget).attr("name");

    variant[field] = value;
    Meteor.call("products/updateVariant", variant, function (error) {
      if (error) {
        throw new Meteor.Error("error updating variant", error);
      }
    });
    return setCurrentVariant(template.data._id);
  },
  "click #remove-child-variant": function (event) {
    event.stopPropagation();
    event.preventDefault();
    let optionTitle = this.optionTitle || "this option";
    if (confirm("Are you sure you want to delete " + optionTitle)) {
      let id = this._id;
      return Meteor.call("products/deleteVariant", id, function (error,
        result) {
        if (result && selectedVariantId() === id) {
          return setCurrentVariant(null);
        }
      });
    }
  }
});
