import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";

class GridItemControls extends Component {
  static propTypes = {
    checked: PropTypes.func,
    hasChanges: PropTypes.func,
    hasCreateProductPermission: PropTypes.func,
    isValid: PropTypes.bool,
    product: PropTypes.object
  }

  renderArchived() {
    if (this.props.product.isDeleted) {
      return (
        <span className="badge badge-danger">
          <Components.Translation defaultValue="Archived" i18nKey="app.archived" />
        </span>
      );
    }
  }

  renderVisibilityButton() {
    if (!this.props.product.__isValid && this.props.hasChanges()) {
      return (
        <div>
          <Components.IconButton
            icon=""
            onIcon=""
            status="danger"
          />
        </div>
      );
    } else if (this.props.hasChanges()) {
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
  }

  render() {
    if (this.props.hasCreateProductPermission()) {
      return (
        <div className="product-grid-controls">
          <label className="like-button hidden" htmlFor={`select-product-${this.props.product._id}`}>
            <input
              type="checkbox"
              name="selectProduct"
              value={this.props.product._id}
              id={`select-product-${this.props.product._id}`}
              checked={this.props.checked()}
              readOnly
            />
          </label>

          {this.renderArchived()}
          {this.renderVisibilityButton()}
        </div>
      );
    }
    return null;
  }
}

export default GridItemControls;
