import React, { Component, PropTypes } from "react";
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
      isClosed: false,
      popOverIsOpen: false,
      selectAllItems: true,
      selectedItems: []
    };

    this.handleDisplayMedia = this.handleDisplayMedia.bind(this);
  }

  togglePopOver = () => {
    if (this.state.popOverIsOpen) {
      return this.setState({ popOverIsOpen: false });
    }
    return this.setState({ popOverIsOpen: true });
  }

  handleSelectAllItems = (e) => {
    const checked = e.target.checked;
    if (checked) {
      return this.setState({ selectAllItems: true });
    }
    return this.setState({ selectAllItems: false });
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
          togglePopOver={this.togglePopOver}
          popOverIsOpen={this.state.popOverIsOpen}
          displayMedia={this.handleDisplayMedia}
          uniqueItems={uniqueItems}
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
