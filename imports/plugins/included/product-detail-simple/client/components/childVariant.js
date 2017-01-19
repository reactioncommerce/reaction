import React, { Component, PropTypes } from "react";
import classnames from "classnames";
import { Translation } from "/imports/plugins/core/ui/client/components";
import { MediaItem } from "/imports/plugins/core/ui/client/components";

class ChildVariant extends Component {
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

  renderMedia() {
    if (this.hasMedia) {
      const media = this.primaryMediaItem;

      return (
        <MediaItem source={media.url()} />
      );
    }

    return null;
  }

  render() {
    const variant = this.props.variant;
    const classes = classnames({
      "btn": true,
      "btn-default": true,
      "variant-detail-selected": this.props.isSelected,
      "variant-deleted": this.props.variant.isDeleted
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

        <div className="variant-controls">
          {this.renderDeletionStatus()}
          {this.renderInventoryStatus()}
          {this.props.visibilityButton}
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
  onClick: PropTypes.func,
  soldOut: PropTypes.bool,
  variant: PropTypes.object,
  visibilityButton: PropTypes.node
};


export default ChildVariant;
