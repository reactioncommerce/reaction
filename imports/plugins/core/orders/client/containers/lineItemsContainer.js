import React, { Component, PropTypes } from "react";
import { composeWithTracker } from "/lib/api/compose";
// import { Reaction } from "/client/api";
import { Loading } from "/imports/plugins/core/ui/client/components";
import { TranslationProvider } from "/imports/plugins/core/ui/client/providers";
import LineItems from "../components/lineItems.js";
import { Media } from "/lib/collections";

class LineItemsContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isExpanded: false
    };
    this.handleDisplayMedia = this.handleDisplayMedia.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(event) {
    event.preventDefault();
    this.setState({ isExpanded: true });
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
          isExpanded={this.state.isExpanded}
          displayMedia={this.handleDisplayMedia}
          handleClick={this.handleClick}
          items={this.props.items}
        />
      </TranslationProvider>
    );
  }
}

LineItemsContainer.propTypes = {
  items: PropTypes.array
};

const composer = (props, onData) => {
  onData(null, {
    items: props.items
  });
};

export default composeWithTracker(composer, Loading)(LineItemsContainer);
