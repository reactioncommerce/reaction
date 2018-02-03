import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";
import { Validation } from "@reactioncommerce/reaction-collections";
import { SortableItem } from "/imports/plugins/core/ui/client/containers";

import { ReactionProduct } from "/lib/api";

import { ProductVariant } from "/lib/collections/schemas";

class Variant extends Component {
  constructor(props) {
    super(props);

    this.validation = new Validation(ProductVariant);

    this.state = {
      invalidVariant: [],
      selfValidation: []
    };
  }

  componentWillMount() {
    this.variantValidation();
  }

  handleClick = (event) => {
    if (this.props.onClick) {
      this.props.onClick(event, this.props.variant);
    }
  }

  handleOnKeyUp = (event) => {
    // keyCode 32 (spacebar)
    // keyCode 13 (enter/return)
    if (event.keyCode === 32 || event.keyCode === 13) {
      this.handleClick(event);
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
          <span className="variant-qty-sold-out badge badge-danger variant-badge-label">
            <Components.Translation defaultValue="Sold Out!" i18nKey="productDetail.soldOut" />
          </span>
        );
      }

      return (
        <span className="variant-qty-sold-out badge badge-info variant-badge-label">
          <Components.Translation defaultValue="Backorder" i18nKey="productDetail.backOrder" />
        </span>
      );
    }

    // If Warning Threshold is met, show Limited Supply Badge
    if (inventoryManagement && this.props.variant.lowInventoryWarningThreshold >= this.props.variant.inventoryTotal) {
      if (inventoryPolicy) {
        return (
          <span className="variant-qty-sold-out badge badge-warning variant-badge-label">
            <Components.Translation defaultValue="Limited Supply" i18nKey="productDetail.limitedSupply" />
          </span>
        );
      }

      return (
        <span className="variant-qty-sold-out badge badge-info variant-badge-label">
          <Components.Translation defaultValue="Backorder" i18nKey="productDetail.backOrder" />
        </span>
      );
    }

    return null;
  }

  renderDeletionStatus() {
    if (this.props.variant.isDeleted) {
      return (
        <span className="badge badge-danger variant-badge-label">
          <Components.Translation defaultValue="Archived" i18nKey="app.archived" />
        </span>
      );
    }

    return null;
  }

  renderValidationButton = () => {
    if (this.state.selfValidation.isValid === false) {
      return (
        <Components.Badge
          status="danger"
          indicator={true}
          tooltip={"Validation error"}
          i18nKeyTooltip={"admin.tooltip.validationError"}
        />
      );
    }
    if (this.state.invalidVariant.length) {
      return (
        <Components.Badge
          status="danger"
          indicator={true}
          tooltip={"Validation error on variant option"}
          i18nKeyTooltip={"admin.tooltip.optionValidationError"}
        />
      );
    }
  }

  variantValidation = () => {
    const variants = ReactionProduct.getVariants(this.props.variant._id);
    let validationStatus;
    let invalidVariant;

    if (variants) {
      validationStatus = variants.map((variant) => this.validation.validate(variant));

      invalidVariant = validationStatus.filter((status) => status.isValid === false);
    }

    const selfValidation = this.validation.validate(this.props.variant);

    this.setState({
      invalidVariant,
      selfValidation
    });
  }

  render() {
    const { variant } = this.props;
    const classes = classnames({
      "variant-detail": true,
      "variant-button": true,
      "variant-detail-selected": this.props.isSelected,
      "variant-deleted": this.props.variant.isDeleted,
      "variant-notVisible": !this.props.variant.isVisible
    });

    let variantTitleElement;

    if (typeof variant.title === "string" && variant.title.length) {
      variantTitleElement = (
        <span className="variant-title">{variant.title}</span>
      );
    } else {
      variantTitleElement = (
        <Components.Translation defaultValue="Label" i18nKey="productVariant.title" />
      );
    }

    const variantElement = (
      <li
        className="variant-list-item"
        id="variant-list-item-{variant._id}"
        key={variant._id}
      >
        <div
          onClick={this.handleClick}
          onKeyUp={this.handleOnKeyUp}
          role="button"
          tabIndex={0}
        >
          <div className={classes}>
            <div className="title">
              {variantTitleElement}
            </div>

            <div className="actions">
              <span className="variant-price">
                <Components.Currency amount={this.price} editable={this.props.editable}/>
              </span>
            </div>
          </div>

          <div className="alerts">
            {this.renderDeletionStatus()}
            {this.renderInventoryStatus()}
            {this.renderValidationButton()}
            {this.props.editButton}
          </div>
        </div>
      </li>
    );

    if (this.props.editable) {
      return this.props.connectDragSource(this.props.connectDropTarget(variantElement));
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

registerComponent("Variant", Variant, SortableItem("product-variant"));

export default SortableItem("product-variant")(Variant);
