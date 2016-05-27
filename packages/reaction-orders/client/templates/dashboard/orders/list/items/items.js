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
    let combinedItems = [];


    if (order) {
      // Lopp through all items in the order. The items are split into indivital items
      for (let orderItem of order.items) {
        // Find an exising item in the combinedItems array
        const foundItem = combinedItems.find((combinedItem) => {
          // If and item variant exists, then we return true
          if (combinedItem.variants) {
            return combinedItem.variants._id === orderItem.variants._id;
          }

          return false;
        });

        // Increment the quantity count for the duplicate product variants
        if (foundItem) {
          foundItem.quantity++;
        } else {
          // Otherwise push the unique item into the combinedItems array
          combinedItems.push(orderItem);
        }
      }

      return combinedItems;
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
