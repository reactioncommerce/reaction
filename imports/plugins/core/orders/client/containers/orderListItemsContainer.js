import React, { Component, PropTypes } from "react";
import OrderListItem from "../components/orderListItems";
import { Media, Shops } from "/lib/collections";

let shopsToItemsMap = {};
class orderListContainer extends Component {
  static propTypes = {
    items: PropTypes.arrayOf(Object)
  }
  constructor() {
    super();
    this.state = {
      shopItemMap: {}
    };
  }
  componentWillMount() {
    this.setState({ shopItemMap: this.handleMapShopsToItems() });
    shopsToItemsMap = {};
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
  handleMapShopsToItems() {
    const items = this.handleItems();
    items.map(item => {
      const shop = Shops.findOne(item.shopId);
      if (shopsToItemsMap.hasOwnProperty(shop.name)) {
        const name = shop.name;
        shopsToItemsMap[name].push(item);
      } else {
        shopsToItemsMap[shop.name] = [item];
      }
    });
    return shopsToItemsMap;
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
        <OrderListItem
          media={this.handleImage}
          shopItemMap={this.state.shopItemMap}
        />
      </div>
    );
  }
}

export default orderListContainer;
