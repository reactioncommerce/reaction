import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import getDisplayPriceByCurrency from "../../lib/helpers/getDisplayPriceByCurrency";

class VariantCustomer extends Component {
  handleOnKeyUp = (event) => {
    // keyCode 32 (spacebar)
    // keyCode 13 (enter/return)
    if (event.keyCode === 32 || event.keyCode === 13) {
      this.handleClick(event);
    }
  }

  handleClick = () => {
    const { onSelectVariant, variant } = this.props;
    onSelectVariant(variant);
  }

  render() {
    const { selectedVariantId, variant } = this.props;
    const classes = classnames({
      "variant-detail": true,
      "variant-button": true,
      "variant-detail-selected": variant._id === selectedVariantId
    });

    return (
      <div
        role="button"
        className="variant-list-item"
        onClick={this.handleClick}
        onKeyUp={this.handleOnKeyUp}
        tabIndex={0}
      >
        <div className={classes}>
          <div className="title">
            <span className="variant-title">{variant.title}</span>
          </div>
          <div className="actions">
            <span className="variant-price">
              <span itemProp="price">{getDisplayPriceByCurrency(variant.pricing)}</span>
            </span>
          </div>
        </div>
      </div>
    );
  }
}

VariantCustomer.propTypes = {
  onSelectVariant: PropTypes.func,
  selectedVariantId: PropTypes.string,
  uiStore: PropTypes.object,
  variant: PropTypes.object
};

export default VariantCustomer;
