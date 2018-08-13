import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";
import VariantCustomer from "./variantCustomer";

class VariantListCustomer extends Component {
  renderVariants() {
    const { product: { variants }, onSelectVariant } = this.props;
    if (variants) {
      return variants.map((variant, index) => (
        <VariantCustomer
          role="button"
          key={variant._id}
          displayPrice={variant.pricing[0].displayPrice}
          index={index}
          variant={variant}
          onSelectVariant={onSelectVariant}
        />
      ));
    }
    return null;
  }

  renderChildVariants() {
    const { product: { variants: [{ options }] } } = this.props;

    if (options.length) {
      const renderOptions = options.map((option, index) => {
        const classes = classnames({
          "btn": true,
          "btn-default": true,
          "variant-button": true,
          "variant-detail-selected": false
        });

        return (
          <div className="variant-select-option" key={index}>
            <button
              className={classes}
              type="button"
            >
              <img
                alt=""
                className="img-responsive"
                src={option.media[0].URLs.large}
              />
              <span className="title">{option.optionTitle}</span>
            </button>
          </div>
        );
      });

      return [
        <Components.Divider
          key="availableOptionsDivider"
          i18nKeyLabel="availableOptions"
          label="Available Options"
        />,
        <div className="row variant-product-options" key="childVariantList">
          {renderOptions}
        </div>
      ];
    }
    return null;
  }

  render() {
    return (
      <div className="product-variants">
        {this.renderVariants()}
        {this.renderChildVariants()}
      </div>
    );
  }
}

VariantListCustomer.propTypes = {
  onSelectVariant: PropTypes.func,
  product: PropTypes.object
};

registerComponent("VariantListCustomer", VariantListCustomer);

export default VariantListCustomer;
