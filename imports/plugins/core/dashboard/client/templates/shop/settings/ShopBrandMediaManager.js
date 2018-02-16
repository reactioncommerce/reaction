import React, { Component } from "react";
import PropTypes from "prop-types";
import MediaUploader from "./mediaUploader";
import ShopBrandImageOption from "./shopBrandImageOption";

const styles = {};

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
        <div style={styles}>
          {this.renderBrandImages()}
        </div>
        <MediaUploader metadata={metadata} />
      </div>
    );
  }
}

export default ShopBrandMediaManager;
