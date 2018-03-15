import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";
import { Validation } from "@reactioncommerce/reaction-collections";
import { ProductVariant } from "/lib/collections/schemas/products";


class ChildVariant extends Component {
  constructor(props) {
    super(props);

    this.validation = new Validation(ProductVariant);

    this.state = {
      invalidVariant: false
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

  get hasMedia() {
    return Array.isArray(this.props.media) && this.props.media.length > 0;
  }

  get primaryMediaItem() {
    if (this.hasMedia) {
      return this.props.media[0];
    }

    return null;
  }

  renderInventoryStatus() {
    const {
      inventoryManagement,
      inventoryPolicy
    } = this.props.variant;

    // If childVariant is sold out, show Sold Out badge
    if (inventoryManagement && this.props.variant.inventoryQuantity <= 0) {
      if (inventoryPolicy) {
        return (
          <span className="variant-qty-sold-out badge badge-danger child-variant-badge-label">
            <Components.Translation defaultValue="Sold Out!" i18nKey="productDetail.soldOut" />
          </span>
        );
      }

      return (
        <span className="variant-qty-sold-out badge badge-info child-variant-badge-label">
          <Components.Translation defaultValue="Backorder" i18nKey="productDetail.backOrder" />
        </span>
      );
    }

    return null;
  }

  renderDeletionStatus() {
    if (this.props.variant.isDeleted) {
      return (
        <span className="badge badge-danger">
          <Components.Translation className="deleted-variant-text" defaultValue="Archived" i18nKey="app.archived" />
        </span>
      );
    }

    return null;
  }

  renderMedia() {
    const media = this.primaryMediaItem;
    if (!media) return null;

    return (
      <Components.MediaItem source={media} />
    );
  }

  renderValidationButton = () => {
    if (this.state.invalidVariant === true) {
      return (
        <Components.Badge
          status="danger"
          indicator={true}
          tooltip={"Validation error"}
          i18nKeyTooltip={"admin.tooltip.validationError"}
          onClick={this.handleClick}
        />
      );
    }
  }

  // checks whether the product variant is validated
  variantValidation = () => {
    const invalidVariant = this.validation.validate(this.props.variant);

    this.setState({
      invalidVariant: !invalidVariant.isValid
    });
  }

  render() {
    const { variant } = this.props;
    const classes = classnames({
      "btn": true,
      "btn-default": true,
      "variant-button": true,
      "variant-detail-selected": this.props.isSelected,
      "variant-deleted": this.props.variant.isDeleted,
      "variant-notVisible": !this.props.variant.isVisible
    });

    return (
      <div className="variant-select-option">
        <button
          className={classes}
          onClick={this.handleClick}
          type="button"
        >
          {this.renderMedia()}
          <span className="title">{variant.optionTitle}</span>
        </button>

        <div className="variant-controls custom-variant-control">
          {this.renderDeletionStatus()}
          {this.renderInventoryStatus()}
          {this.renderValidationButton()}
          {this.props.editButton}
        </div>
      </div>
    );
  }
}

ChildVariant.propTypes = {
  editButton: PropTypes.node,
  isSelected: PropTypes.bool,
  media: PropTypes.arrayOf(PropTypes.object),
  onClick: PropTypes.func.isRequired,
  soldOut: PropTypes.bool,
  variant: PropTypes.object,
  visibilityButton: PropTypes.node
};

registerComponent("ChildVariant", ChildVariant);

export default ChildVariant;
