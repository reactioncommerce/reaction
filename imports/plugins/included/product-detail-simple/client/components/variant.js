import React, { Component, PropTypes } from "react";
import classnames from "classnames";
import { Currency, Translation } from "/imports/plugins/core/ui/client/components";
import { SortableItem } from "/imports/plugins/core/ui/client/containers";

class Variant extends Component {

  handleClick = (event) => {
    if (this.props.onClick) {
      this.props.onClick(event, this.props.variant);
    }
  }

  get price() {
    return this.props.displayPrice || this.props.variant.price;
  }

  renderInventoryStatus() {
    const {
      inventoryManagement,
      inventoryPolicy
    } = this.props.variant;

    // If variant is sold out, show Sold Out badge
    if (inventoryManagement && this.props.soldOut) {
      if (inventoryPolicy) {
        return (
          <span className="variant-qty-sold-out badge badge-danger">
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

    // If Warning Threshold is met, show Limited Supply Badge
    if (inventoryManagement && this.props.variant.lowInventoryWarningThreshold >= this.props.variant.inventoryTotal) {
      if (inventoryPolicy) {
        return (
          <span className="variant-qty-sold-out badge badge-warning">
            <Translation defaultValue="Limited Supply" i18nKey="productDetail.limitedSupply" />
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

  renderDeletionStatus() {
    if (this.props.variant.isDeleted) {
      return (
        <span className="badge badge-danger">
          <Translation defaultValue="Archived" i18nKey="app.archived" />
        </span>
      );
    }

    return null;
  }

  render() {
    const variant = this.props.variant;
    const classes = classnames({
      "variant-detail": true,
      "variant-detail-selected": this.props.isSelected,
      "variant-deleted": this.props.variant.isDeleted
    });

    let variantTitleElement;

    if (typeof variant.title === "string" && variant.title.length) {
      variantTitleElement = (
        <span className="variant-title">{variant.title}</span>
      );
    } else {
      variantTitleElement = (
        <Translation defaultValue="Label" i18nKey="productVariant.title" />
      );
    }

    const variantElement = (
      <li
        className="variant-list-item"
        id="variant-list-item-{variant._id}"
        key={variant._id}
        onClick={this.handleClick}
      >
        <div className={classes}>
          <div className="title">
            {variantTitleElement}
          </div>

          <div className="actions">
            <span className="variant-price">
              <Currency amount={this.price} editable={this.props.editable}/>
            </span>
          </div>

          <div className="alerts">
            {this.renderDeletionStatus()}
            {this.renderInventoryStatus()}
            {this.props.visibilityButton}
            {this.props.editButton}
          </div>
        </div>
      </li>
    );

    if (this.props.editable) {
      return this.props.connectDragSource(
        this.props.connectDropTarget(
          variantElement
        )
      );
    }

    return variantElement;
  }
}

Variant.propTypes = {
  connectDragSource: PropTypes.func,
  connectDropTarget: PropTypes.func,
  displayPrice: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  editButton: PropTypes.node,
  editable: PropTypes.bool,
  isSelected: PropTypes.bool,
  onClick: PropTypes.func,
  soldOut: PropTypes.bool,
  variant: PropTypes.object,
  visibilityButton: PropTypes.node
};

export default SortableItem("product-variant", Variant);
