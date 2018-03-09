import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";
import ShopBrandImageOption from "./shopBrandImageOption";

class ShopBrandMediaManager extends Component {
  static propTypes = {
    brandMediaList: PropTypes.arrayOf(PropTypes.object),
    metadata: PropTypes.object,
    selectedMediaId: PropTypes.string
  };

  renderBrandImages() {
    const { brandMediaList, selectedMediaId } = this.props;

    return (brandMediaList || []).map((media) => (
      <ShopBrandImageOption key={media._id} isSelected={selectedMediaId === media._id} media={media} />
    ));
  }

  render() {
    const { metadata } = this.props;

    return (
      <div>
        {/* DragDropProvider is needed to avoid errors but we don't currently support dragging */}
        <Components.DragDropProvider>
          <div className="rui gallery-thumbnails">
            {this.renderBrandImages()}
          </div>
        </Components.DragDropProvider>
        <Components.MediaUploader metadata={metadata} />
      </div>
    );
  }
}

export default ShopBrandMediaManager;
