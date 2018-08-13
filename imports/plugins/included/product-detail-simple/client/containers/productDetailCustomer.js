import React, { Component } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { compose } from "recompose";
import { StyleRoot } from "radium";
import { inject, observer } from "mobx-react";
import { Components, registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { Reaction } from "/client/api";
import withCatalogItemProduct from "/imports/plugins/core/graphql/lib/hocs/withCatalogItemProduct";
import { ProductDetailCustomer } from "../components";

/**
 *
 * @method getDisplayPrice
 * @summary Gets the display price per given pricing array from a product, variant, or option
 * @param {Array} pricingArr - An array of pricing info
 * @param {Array} currencyCode - Selected currency of customer
 * @return {String} - Display price of a product, variant, or option
 */
function getDisplayPrice(pricingArr, currencyCode = "USD") {
  const currencyPricing = pricingArr.filter((pricing) => pricing.currency.code === currencyCode);
  return currencyPricing[0].displayPrice;
}

const wrapComponent = (Comp) =>
  @inject("uiStore")
  @observer
  class ProductDetailCustomerContainer extends Component {
    static propTypes = {
      isLoading: PropTypes.bool,
      product: PropTypes.object,
      template: PropTypes.string,
      uiStore: PropTypes.object
    };

    UNSAFE_componentWillReceiveProps(nextProps) { // eslint-disable-line camelcase
      const { uiStore } = this.props;
      const { product } = nextProps;
      if (!this.props.product && product) {
        uiStore.setPDPSelectedVariantId("", "");
      }
    }

    componentWillReact() {
      console.log(this.props.uiStore);
    }

    selectVariant(variant, optionId) {
      const { uiStore } = this.props;

      // Select the variant, and if it has options, the first option
      const variantId = variant._id;
      let selectOptionId = optionId;
      if (!selectOptionId && variant.options && variant.options.length) {
        selectOptionId = variant.options[0]._id;
      }
      uiStore.setPDPSelectedVariantId(variantId, selectOptionId);
      console.log(`new selected variant is ${uiStore.pdpSelectedVariantId}`);
    }

    handleSelectVariant = (variant) => {
      this.selectVariant(variant);
    };

    handleSelectOption = (option) => {
      const { product, uiStore } = this.props;

      // If we are clicking an option, it must be for the current selected variant
      const variant = product.variants.find((vnt) => vnt._id === uiStore.pdpSelectedVariantId);

      this.selectVariant(variant, option._id);
    };

    getPriceRange() {
      const {
        product,
        uiStore: {
          pdpSelectedVariantId,
          pdpSelectedOptionId
        }
      } = this.props;
      if (!pdpSelectedVariantId) {
        return getDisplayPrice(product.pricing);
      }
      const selectedVariant = product.variants.filter((variant) => variant._id === pdpSelectedVariantId);
      if (!pdpSelectedOptionId) {
        return getDisplayPrice(selectedVariant.pricing);
      }
      const selectedOption = selectedVariant.options.filter((option) => option._id === pdpSelectedOptionId);
      return getDisplayPrice(selectedOption.pricing);
    }

    render() {
      const {
        product,
        isLoading,
        uiStore: {
          pdpSelectedVariantId
        }
      } = this.props;
      console.log(this.props.uiStore.pdpSelectedVariantId);
      if (_.isEmpty(product) && !isLoading) {
        return <Components.ProductNotFound />;
      } else if (isLoading) {
        return (
          <StyleRoot>
            <Comp isLoading={true} {...this.props} />
          </StyleRoot>
        );
      }
      let template = "productDetailSimpleCustomer";
      if (product.template) {
        template = `${product.template}Customer`;
      }

      const priceRange = this.getPriceRange();
      return (
        <StyleRoot>
          <Comp
            layout={template}
            {...this.props}
            priceRange={priceRange}
            tags={product.tags.nodes}
            template={template}
            onSelectOption={this.handleSelectOption}
            onSelectVariant={this.handleSelectVariant}
            selectedVariant={pdpSelectedVariantId}
          />
        </StyleRoot>
      );
    }
  };

/**
 * @name composer
 * @private
 * @summary Loads product handle from browser and passes it to GraphQL HOCs
 * @param {Object} props - Props passed down from parent components
 * @param {Function} onData - Callback to execute with props
 * @returns {undefined}
 */
function composer(props, onData) {
  // Prevent loading GraphQL HOCs if we don't have a user account yet. All users (even anonymous) have accounts
  if (!Meteor.user()) {
    return;
  }

  const productId = Reaction.Router.getParam("handle");

  onData(null, {
    productId
  });
}

registerComponent("ProductDetailCustomer", ProductDetailCustomer, [
  composeWithTracker(composer),
  withCatalogItemProduct,
  wrapComponent
]);

// Decorate component and export
export default compose(
  composeWithTracker(composer),
  withCatalogItemProduct,
  wrapComponent
)(ProductDetailCustomer);
