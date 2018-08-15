import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";
import VariantCustomer from "./variantCustomer";

class VariantListCustomer extends Component {
  renderVariants() {
    const { product: { variants }, selectedVariantId, onSelectVariant } = this.props;
    if (variants) {
      const renderVariantsList = variants.map((variant, index) => (
        <VariantCustomer
          role="button"
          key={variant._id}
          index={index}
          variant={variant}
          onSelectVariant={onSelectVariant}
          selectedVariantId={selectedVariantId}
        />
      ));
      return [
        <Components.Divider
          i18nKeyLabel="productDetail.options"
          key="dividerWithLabel"
          label="Options"
        />,
        renderVariantsList
      ];
    }
    return null;
  }

  handleSelectOption = (option) => {
    const { onSelectOption } = this.props;
    onSelectOption(option);
  }

  renderChildVariants() {
    const { product, selectedVariantId, selectedOptionId } = this.props;
    const selectedVariant = product.variants.find((variant) => variant._id === selectedVariantId);
    if (selectedVariant && selectedVariant.options && selectedVariant.options.length) {
      const renderOptions = selectedVariant.options.map((option, index) => {
        const classes = classnames({
          "btn": true,
          "btn-default": true,
          "variant-button": true,
          "variant-detail-selected": option._id === selectedOptionId
        });

        return (
          <div className="variant-select-option" key={index}>
            <button
              className={classes}
              type="button"
              onClick={() => this.handleSelectOption(option)}
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
  onSelectOption: PropTypes.func,
  onSelectVariant: PropTypes.func,
  product: PropTypes.object,
  selectedOptionId: PropTypes.string,
  selectedVariantId: PropTypes.string
};

registerComponent("VariantListCustomer", VariantListCustomer);

export default VariantListCustomer;
