import React, { Component } from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { composeWithTracker } from "/lib/api/compose";
import { Media } from "/lib/collections";
import { Loading } from "/imports/plugins/core/ui/client/components";
import { TranslationProvider } from "/imports/plugins/core/ui/client/providers";
import LineItems from "../components/lineItems.js";

class LineItemsContainer extends Component {
  static propTypes = {
    invoice: PropTypes.object,
    uniqueItems: PropTypes.array
  }

  constructor(props) {
    super(props);
    this.state = {
      notHovered: true,
      isClosed: false,
      isUpdating: false,
      popOverIsOpen: false,
      selectAllItems: false,
      selectedItems: [],
      editedItems: [],
      value: undefined
    };

    this.handleDisplayMedia = this.handleDisplayMedia.bind(this);
    this.applyRefund = this.applyRefund.bind(this);
  }

  togglePopOver = () => {
    if (this.state.popOverIsOpen) {
      return this.setState({
        popOverIsOpen: false,
        selectAllItems: false,
        selectedItems: [],
        editedItems: []
      });
    }
    return this.setState({ popOverIsOpen: true });
  }

  toggleUpdating = (isUpdating) => {
    return this.setState({ isUpdating });
  }

  handleSelectAllItems = (uniqueItems) => {
    if (this.state.selectAllItems) {
      // if all items are selected, clear the selectedItems array
      // and set selectAllItems to false
      this.setState({
        selectedItems: [],
        selectAllItems: false
      });
    } else {
      // if there are no selected items, or if there are some items that have been
      // selected but not all of them, loop through the items array and return a
      // new array with item ids only, then set the selectedItems array with the itemIds
      const itemIds = uniqueItems.map((item) => {
        return item._id;
      });
      this.setState({
        selectedItems: itemIds,
        selectAllItems: true,
        isUpdating: true
      });
    }
  }

  inputOnChange = (event, value, lineItem) => {
    let { editedItems } = this.state;
    console.log("value---->", value);
    // console.log("uniqItem-->", lineItem);
    const isEdited = editedItems.find(item => {
      return item.id === lineItem._id;
    });

    // console.log("isEdited--->", isEdited);

    const refundedQuantity = lineItem.quantity - value;

    if (isEdited) {
      editedItems = editedItems.filter(item => item.id !== lineItem._id);
      isEdited.refundedTotal = lineItem.variants.price * refundedQuantity;
      isEdited.refundedQuantity = refundedQuantity;
      editedItems.push(isEdited);
    } else {
      editedItems.push({
        id: lineItem._id,
        title: lineItem.title,
        refundedTotal: lineItem.variants.price * refundedQuantity,
        refundedQuantity
      });
    }
    this.setState({
      editedItems
    });
  }

  handleItemSelect = (itemId) => {
    const { selectedItems, editedItems } = this.state;

    if (!selectedItems.includes(itemId)) {
      selectedItems.push(itemId);
      this.setState({
        selectedItems,
        isUpdating: true,
        selectAllItems: false
      });
    } else {
      // remove item from selected items
      const updatedSelectedArray = selectedItems.filter((id) => {
        if (id !== itemId) {
          return id;
        }
      });
      // remove item from edited quantities
      const updatedEditedItems = editedItems.filter(item => item.id !== itemId);

      this.setState({
        selectedItems: updatedSelectedArray,
        isUpdating: true,
        selectAllItems: false,
        editedItems: updatedEditedItems
      });
    }
  }

  /**
   * Media - find media based on a product/variant
   * @param  {Object} item object containing a product and variant id
   * @return {Object|false} An object contianing the media or false
   */
  handleDisplayMedia = (item) => {
    const variantId = item.variants._id;
    const productId = item.productId;

    const variantImage = Media.findOne({
      "metadata.variantId": variantId,
      "metadata.productId": productId
    });

    if (variantImage) {
      return variantImage;
    }

    const defaultImage = Media.findOne({
      "metadata.productId": productId,
      "metadata.priority": 0
    });

    if (defaultImage) {
      return defaultImage;
    }
    return false;
  }

  applyRefund = () => {
    console.log("Order Id----?", this.props.order._id);
    const paymentMethod = orderCreditMethod(this.props.order).paymentMethod;
    // const amount = this.getRefundedItemsInfo().total;
    // const quantity = this.getRefundedItemsInfo().quantity;
    console.log("paymentMethod ---->", paymentMethod);
    console.log("editedItems", this.state.editedItems);
    const editedItems = this.state.editedItems;
    Meteor.call("orders/refunds/returnItems", this.props.order._id, paymentMethod, editedItems);
  }

  getRefundedItemsInfo = () => {
    const { editedItems } = this.state;
    return {
      quantity: editedItems.reduce((acc, item) => acc + item.refundedQuantity, 0),
      total: editedItems.reduce((acc, item) => acc + item.refundedTotal, 0)
    };
  }

  render() {
    const { uniqueItems } = this.props;
    return (
      <TranslationProvider>
        <LineItems
          onClose={this.handleClose}
          handleSelectAllItems={this.handleSelectAllItems}
          selectAllItems={this.state.selectAllItems}
          selectedItems={this.state.selectedItems}
          togglePopOver={this.togglePopOver}
          inputOnChange={this.inputOnChange}
          handleItemSelect={this.handleItemSelect}
          popOverIsOpen={this.state.popOverIsOpen}
          displayMedia={this.handleDisplayMedia}
          uniqueItems={uniqueItems}
          editedItems={this.state.editedItems}
          isUpdating={this.state.isUpdating}
          toggleUpdating={this.toggleUpdating}
          applyRefund={this.applyRefund}
          getRefundedItemsInfo={this.getRefundedItemsInfo}
          handleApprove={this.handleApprove}
        />
      </TranslationProvider>
    );
  }
}

// helper to return the order payment object
// the first credit paymentMethod on the order
// returns entire payment method
function orderCreditMethod(order) {
  return order.billing.filter(value => value.paymentMethod.method ===  "credit")[0];
}

const composer = (props, onData) => {
  const subscription = Meteor.subscribe("Media");
  if (subscription.ready()) {
    onData(null, {
      uniqueItems: props.items,
      order: props.order
    });
  }
};

export default composeWithTracker(composer, Loading)(LineItemsContainer);
