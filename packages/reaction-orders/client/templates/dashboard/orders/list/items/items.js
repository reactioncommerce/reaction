import { NumericInput } from "meteor/reactioncommerce:reaction-ui";

/**
 * ordersListItems helpers
 *
 */
Template.ordersListItems.helpers({
  media: function () {
    const variantImage = ReactionCore.Collections.Media.findOne({
      "metadata.productId": this.productId,
      "metadata.variantId": this.variants._id
    });
    // variant image
    if (variantImage) {
      return variantImage;
    }
    // find a default image
    const productImage = ReactionCore.Collections.Media.findOne({
      "metadata.productId": this.productId
    });
    if (productImage) {
      return productImage;
    }
    return false;
  },

  items() {
    const { order } = Template.instance().data;

    if (order) {
      return order.items;
    }

    return false;
  },

  numericInputProps(value) {
    const { currencyFormat } = Template.instance().data;

    return {
      component: NumericInput,
      value,
      format: currencyFormat,
      isEditing: false
    };
  }
});
