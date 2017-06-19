import React, { Component, PropTypes } from "react";
import OrderListItem from "../components/orderListItems";
import { Media } from "/lib/collections";

class orderListContainer extends Component {
  static propTypes = {
    items: PropTypes.arrayOf(Object)
  }
  handleImage(item) {
    const variantImage = Media.findOne({
      "metadata.productId": item.productId,
      "metadata.variantId": item.variants._id
    });
    // variant image
    if (variantImage) {
      return variantImage;
    }
    // find a default image
    const productImage = Media.findOne({
      "metadata.productId": item.productId
    });
    if (productImage) {
      return productImage;
    }
    return false;
  }
  /**
   * This method helps duplicating of existing lineItems and instead increases the quantity if item already exists
   * @return {Array} combinedItems
   */
  handleItems() {
    const { items } = this.props;
    const combinedItems = [];
    for (const orderItem of items) {
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
  render() {
    return (
        <div>
          {this.handleItems().map(item => {
            return (
              <OrderListItem
                key={item._id}
                media={this.handleImage(item)}
                orderItem={item}
              />
            );
          })
          }
        </div>
    );
  }
}

export default orderListContainer;
