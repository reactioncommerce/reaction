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
      editedItems: []
    };

    this.handleDisplayMedia = this.handleDisplayMedia.bind(this);
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

  handleSelectAllItems = (e, uniqueItems) => {
    const { selectedItems } = this.state;
    const checked = e.target.checked;

    uniqueItems.map(item => {
      if (!selectedItems.includes(item._id)) {
        selectedItems.push(item._id);
      }
    });

    if (checked) {
      return this.setState({
        selectAllItems: true,
        isUpdating: true,
        selectedItems
      });
    }

    return this.setState({
      selectAllItems: false,
      selectedItems: [],
      isUpdating: true,
      editedItems: []
    });
  }

  inputOnChange = (quantityValue, lineItem) => {
    let { editedItems } = this.state;

    const itemQuantity = editedItems.find(item => {
      return item.id === lineItem._id;
    });

    const refundedQuantity = lineItem.quantity - quantityValue;

    if (itemQuantity) {
      editedItems = editedItems.filter(item => item.id !== lineItem._id);
      itemQuantity.refundedTotal = lineItem.variants.price * refundedQuantity;
      itemQuantity.refundedQuantity = refundedQuantity;
      editedItems.push(itemQuantity);
    } else {
      editedItems.push({
        id: lineItem._id,
        title: lineItem.title,
        refundedTotal: lineItem.variants.price * refundedQuantity,
        refundedQuantity
      });
    }

    return this.setState({ editedItems });
  }

  handleItemSelect = (itemId) => {
    let { selectedItems, editedItems } = this.state;
    if (!selectedItems.includes(itemId)) {
      selectedItems.push(itemId);
      return this.setState({
        selectedItems,
        isUpdating: true,
        selectAllItems: false });
    }

    selectedItems = selectedItems.filter((id) => {
      if (id !== itemId) {
        return id;
      }
    });

    // remove item from edited quantities
    editedItems = editedItems.filter(item => item.id !== itemId);

    return this.setState({
      selectedItems,
      isUpdating: true,
      selectAllItems: false,
      editedItems
    });
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

  render() {
    const { invoice, uniqueItems } = this.props;
    return (
      <TranslationProvider>
        <LineItems
          onClose={this.handleClose}
          invoice={invoice}
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
        />
      </TranslationProvider>
    );
  }
}

const composer = (props, onData) => {
  const subscription = Meteor.subscribe("Media");
  if (subscription.ready()) {
    onData(null, {
      uniqueItems: props.items,
      invoice: props.invoice
    });
  }
};

export default composeWithTracker(composer, Loading)(LineItemsContainer);
