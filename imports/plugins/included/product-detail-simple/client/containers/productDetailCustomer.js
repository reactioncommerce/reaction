import React, { Component } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { compose } from "recompose";
import { StyleRoot } from "radium";
import { Components, registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { Reaction } from "/client/api";
import withCatalogItemProduct from "/imports/plugins/core/graphql/lib/hocs/withCatalogItemProduct";
import getDisplayPriceByCurrency from "../../lib/helpers/getDisplayPriceByCurrency";
import { ProductDetailCustomer } from "../components";

const wrapComponent = (Comp) =>
  class ProductDetailCustomerContainer extends Component {
    static propTypes = {
      isLoading: PropTypes.bool,
      product: PropTypes.object,
      template: PropTypes.string
    };

    constructor(props) {
      super(props);
      this.state = {
        selectedVariantId: "",
        selectedOptionId: ""
      };
    }

    UNSAFE_componentWillReceiveProps(nextProps) { // eslint-disable-line camelcase
      const { product } = nextProps;
      if (!this.props.product && product) {
        this.selectVariant(product.variants[0]);
      }
    }

    selectVariant = (variant, selectedOptionId) => {
      const selectedVariantId = variant._id;
      // const selectedOptionId = optionId;
      // if (!selectedOptionId && variant.options && variant.options.length) {
      //   selectedOptionId = variant.options[0]._id;
      // }
      this.setState({
        selectedVariantId,
        selectedOptionId
      });
    }

    handleSelectVariant = (variant) => {
      this.selectVariant(variant);
    }

    handleSelectOption = (option) => {
      const { product } = this.props;
      const { selectedVariantId } = this.state;
      // If we are clicking an option, it must be for the current selected variant
      const variant = product.variants.find((vnt) => vnt._id === selectedVariantId);
      this.selectVariant(variant, option._id);
    };

    getDisplayPriceOfSelectedVariantOrOption() {
      const { product } = this.props;
      const { selectedVariantId, selectedOptionId } = this.state;
      if (!selectedVariantId) {
        return getDisplayPriceByCurrency(product.pricing);
      }
      const selectedVariant = product.variants.find((variant) => variant._id === selectedVariantId);
      if (!selectedOptionId) {
        return getDisplayPriceByCurrency(selectedVariant.pricing);
      }
      const selectedOption = selectedVariant.options.find((option) => option._id === selectedOptionId);
      return getDisplayPriceByCurrency(selectedOption.pricing);
    }

    render() {
      const { product, isLoading } = this.props;
      const { selectedVariantId, selectedOptionId } = this.state;
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

      const displayPrice = this.getDisplayPriceOfSelectedVariantOrOption();
      return (
        <StyleRoot>
          <Comp
            layout={template}
            {...this.props}
            displayPrice={displayPrice}
            tags={product.tags.nodes}
            template={template}
            onSelectOption={this.handleSelectOption}
            onSelectVariant={this.handleSelectVariant}
            selectedVariantId={selectedVariantId}
            selectedOptionId={selectedOptionId}
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
