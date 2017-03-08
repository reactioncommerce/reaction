import React, { Component, PropTypes } from "react";
import { composeWithTracker } from "/lib/api/compose";
import { Loading } from "/imports/plugins/core/ui/client/components";
import { TranslationProvider } from "/imports/plugins/core/ui/client/providers";
import LineItems from "../components/lineItems.js";
import { Media } from "/lib/collections";

class LineItemsContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isClosed: false
    };
    this.handleDisplayMedia = this.handleDisplayMedia.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.isExpanded = this.isExpanded.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  isExpanded(itemId) {
    if (this.state[`item_${itemId}`]) {
      return true;
    }
    return false;
  }

  handleClose(itemId) {
    event.preventDefault();
    this.setState({
      [`item_${itemId}`]: false
    });
  }

  handleClick(itemId) {
    this.setState({
      [`item_${itemId}`]: true
    });
  }

  handleDisplayMedia(variantObject) {
    const defaultImage = Media.findOne({
      "metadata.variantId": variantObject._id,
      "metadata.priority": 0
    });

    if (defaultImage) {
      return defaultImage;
    }
    return false;
  }

  render() {
    return (
      <TranslationProvider>
        <LineItems
          onClose={this.handleClose}
          isClosed={this.state.isClosed}
          isExpanded={this.isExpanded}
          displayMedia={this.handleDisplayMedia}
          handleClick={this.handleClick}
          items={this.props.items}
          uniqueItems={this.props.uniqueItems}
        />
      </TranslationProvider>
    );
  }
}

LineItemsContainer.propTypes = {
  items: PropTypes.array,
  uniqueItems: PropTypes.array
};

const composer = (props, onData) => {
  console.log("compose props", props);
  const lineItems = props.items;
  onData(null, {
    items: lineItems.items,
    uniqueItems: lineItems.uniqueItems
  });
};

export default composeWithTracker(composer, Loading)(LineItemsContainer);
