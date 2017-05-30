import React, { Component, PropTypes } from "react";

class ProductGridItems extends Component {
  static propTypes = {
    pdpPath: PropTypes.func,
    product: PropTypes.object
  }

  render() {
    return (
      <div>
        <li
          className="product-grid-item {{#if positions.pinned}}pinned{{/if}} {{weightClass}} {{isSelected}}"
          data-id={this.props.product._id}
          id={this.props.product._id}
        >
          <span className="product-grid-item-alerts" />

          <a className="product-grid-item-images"
            href={this.props.pdpPath()}
            data-event-category="grid"
            data-event-action="productClick"
            data-event-label="grid product click"
            data-event-value={this.props.product._id}
          >

            <div className="product-primary-images {{#unless isVisible}}not-visible{{/unless}}">

                <span className="product-image" />

                <span className="product-image"  />


                <div className="prodcut-grid-overlay" />

            </div>

            <div className="product-additional-images {{#unless isVisible}}not-visible{{/unless}}">

                <span className="product-image" />


                <div className="prodcut-grid-overlay" />

            </div>
          </a>
        </li>
      </div>
    );
  }

}

export default ProductGridItems;
