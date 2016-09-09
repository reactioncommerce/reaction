import React, { Component, PropTypes} from "react";
import classnames from "classnames";
import {
  Currency,
  Translation
} from "/imports/plugins/core/ui/client/components";
import { SortableItem } from "/imports/plugins/core/ui/client/containers";

class Variant extends Component {

  handleClick = (event) => {
    if (this.props.onClick) {
      this.props.onClick(event, this.props.variant);
    }
  }

  get quantity() {
    return this.props.quantity; //ReactionProduct.getVariantQuantity(this);
  }
  get price() {
    return this.props.displayPrice || this.props.variant.price;
  }
  get isSoldOut() {
    return this.props.isSoldOut; //ReactionProduct.getVariantQuantity(this) < 1;
  }

  renderInventoryStatus() {
    const {
      inventoryManagement,
      inventoryPolicy
    } = this.props.variant;

    if (inventoryManagement && this.props.soldOut) {
      if (inventoryPolicy) {
        return (
          <span className="variant-qty-sold-out badge badge-warning">
            <Translation defaultValue="Sold Out!" i18nKey="productDetail.soldOut" />
          </span>
        );
      }

      return (
        <span className="variant-qty-sold-out badge badge-info">
          <Translation defaultValue="Backorder" i18nKey="productDetail.backOrder" />
        </span>
      );
    }

    return null;
  }

  render() {
    const variant = this.props.variant;
    const classes = classnames({
      "variant-detail": true,
      "variant-detail-selected": this.props.isSelected
    });

    return (
      <li
        className="variant-list-item"
        id="variant-list-item-{variant._id}"
        key={variant._id}
        onClick={this.handleClick}
      >
        <div className={classes}>
          <div className="title">
            <span className="variant-title">{variant.title}</span>
          </div>

          <div className="actions">
            <span className="variant-price">
              <Currency amount={this.price}/>
            </span>
          </div>

          <div className="alerts">
            {this.renderInventoryStatus()}
            {this.props.visibilityButton}
            {this.props.editButton}
          </div>
        </div>
      </li>
    );
  }
}

Variant.propTypes = {
  onClick: PropTypes.func
};

export default SortableItem("product-variant", Variant);
