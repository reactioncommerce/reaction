import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";

class ProductMetadataCustomer extends Component {
  render() {
    const { product: { metafields } } = this.props;
    if (metafields.length > 0) {
      return (
        <div className="pdp product-metadata">
          <h3 className="meta-header">
            <Components.Translation defaultValue="Details" i18nKey="productDetail.details" />
          </h3>
          <div className="rui metadata">
            {
              metafields.map((metadata, index) => (
                <div className="rui meta-item" key={index}>
                  <div className="rui meta-key">{metadata.key}</div>
                  <div className="rui meta-value">{metadata.value}</div>
                </div>
              ))
            }
          </div>
        </div>
      );
    }

    return null;
  }
}

ProductMetadataCustomer.propTypes = {
  product: PropTypes.object
};

registerComponent("ProductMetadataCustomer", ProductMetadataCustomer);

export default ProductMetadataCustomer;
