import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";

class GridItemControls extends Component {
  static propTypes = {
    hasChanges: PropTypes.bool,
    hasCreateProductPermission: PropTypes.bool,
    isSelected: PropTypes.bool,
    isValid: PropTypes.bool,
    product: PropTypes.object
  }

  renderArchived() {
    const { product } = this.props;

    if (product.isDeleted) {
      return (
        <span className="badge badge-danger">
          <Components.Translation defaultValue="Archived" i18nKey="app.archived" />
        </span>
      );
    }
    return null;
  }

  renderVisibilityButton() {
    const { hasChanges, product } = this.props;

    if (!hasChanges) return null;

    if (!product.__isValid) {
      return (
        <div>
          <Components.IconButton
            icon=""
            onIcon=""
            status="danger"
          />
        </div>
      );
    }

    return (
      <div>
        <Components.IconButton
          icon=""
          onIcon=""
          status="info"
        />
      </div>
    );
  }

  render() {
    const { isSelected, hasCreateProductPermission, product } = this.props;

    if (!hasCreateProductPermission) return null;

    return (
      <div className="product-grid-controls">
        <label className="like-button hidden" htmlFor={`select-product-${product._id}`}>
          <input
            type="checkbox"
            name="selectProduct"
            value={product._id}
            id={`select-product-${product._id}`}
            checked={isSelected}
            readOnly
          />
        </label>

        {this.renderArchived()}
        {this.renderVisibilityButton()}
      </div>
    );
  }
}

export default GridItemControls;
