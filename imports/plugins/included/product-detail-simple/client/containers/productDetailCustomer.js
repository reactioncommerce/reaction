import React, { Component } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { compose } from "recompose";
import { StyleRoot } from "radium";
import { Components, registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { Reaction } from "/client/api";
import withCatalogItemProduct from "/imports/plugins/core/graphql/lib/hocs/withCatalogItemProduct";
import withAddCartItems from "/imports/plugins/core/graphql/lib/hocs/withAddCartItems";
import withCreateCart from "/imports/plugins/core/graphql/lib/hocs/withCreateCart";
import withPrimaryShopId from "/imports/plugins/core/graphql/lib/hocs/withPrimaryShopId";
import withShop from "/imports/plugins/core/graphql/lib/hocs/withShop";
import withViewer from "/imports/plugins/core/graphql/lib/hocs/withViewer";
import withAccountCart from "/imports/plugins//core/graphql/lib/hocs/withAccountCart";
import getDisplayPriceByCurrency from "../util/getDisplayPriceByCurrency";
import { ProductDetailCustomer } from "../components";

const wrapComponent = (Comp) =>
  class ProductDetailCustomerContainer extends Component {
    static propTypes = {
      addCartItems: PropTypes.func,
      addCartItemsData: PropTypes.object,
      cartId: PropTypes.string,
      cartItems: PropTypes.arrayOf(PropTypes.object),
      catalogItemProduct: PropTypes.object,
      createCart: PropTypes.func,
      createCartData: PropTypes.object,
      hasMoreCartItems: PropTypes.bool,
      isLoadingCatalogItemProduct: PropTypes.bool,
      loadMoreCartItems: PropTypes.func,
      refetchCartData: PropTypes.func,
      shop: PropTypes.object,
      shopId: PropTypes.string,
      template: PropTypes.string
    };

    constructor(props) {
      super(props);
      // If PDP is accessed through a page refresh, component is reconstructed
      // when product is received from graphql HOC
      // componentDidUpdate will not be called, so media and selectedVariant should be set here
      let selectedVariant;
      let selectedVariantId;
      let selectedOptionId;
      let mediaList;
      let featuredMedia;
      const { catalogItemProduct: product } = props;
      if (props.variantId && product && product.variants && product.variants.length > 0) {
        const variants = product.variants;
        // Check if any option is selected
        for (const variant of variants) {
          if (variant.options && variant.options.length > 0) {
            const selectedOption = variant.options.find((option) => option.variantId === props.variantId);
            if (selectedOption) {
              selectedVariant = variant;
              selectedOptionId = selectedOption.variantId;
              featuredMedia = selectedOption.media ? selectedOption.media[0] : null;
            }
            break;
          }
        }
        if (!selectedVariant) {
          selectedVariant = product.variants[0]
        }
        selectedVariantId = selectedVariant.variantId;
        mediaList = selectedVariant.media;
      }
      this.state = {
        cartQuantity: 1,
        featuredMedia,
        media: mediaList,
        selectedVariantId,
        selectedOptionId
      };
    }

    componentDidMount() {
      const { hasMoreCartItems, loadMoreCartItems } = this.props;
      if (hasMoreCartItems) {
        loadMoreCartItems();
      }
    }

    componentDidUpdate(prevProps, prevState) {
      // If accessed by clicking from product grid, component is not reconstructed
      // so selectedVariant should be set here
      const { catalogItemProduct: product, loadMoreCartItems } = this.props;
      if (prevProps.hasMoreCartItems) {
        loadMoreCartItems();
      }
      if (product && prevState && !prevState.selectedVariantId) {
        let selectedVariant;
        let selectedOptionId;
        if (this.props.variantId && product.variants && product.variants.length > 0) {
          const variants = product.variants;
          // Check if any option is selected
          for (const variant of variants) {
            if (variant.options && variant.options.length > 0) {
              const selectedOption = variant.options.find((option) => option.variantId === this.props.variantId);
              if (selectedOption) {
                selectedVariant = variant;
                selectedOptionId = selectedOption.variantId;
                break;
              }
            }
          }
          if (!selectedVariant) {
            selectedVariant = product.variants[0]
          }
        }
        this.handleSelectVariant(selectedVariant, selectedOptionId);
      }
    }

    selectVariant = (variant, selectedOptionId) => {
      if (!variant) {
        return;
      }
      const selectedVariantId = variant.variantId;
      let mediaList;
      let featuredMedia;
      if (variant.primaryImage) {
        mediaList = variant.media;
        if (selectedOptionId) {
          const selectedOption = variant.options.find((option) => option.variantId === selectedOptionId);
          if (selectedOption.primaryImage) {
            mediaList = selectedOption.media;
            if (selectedOption.media && selectedOption.media.length > 0) {
              featuredMedia = selectedOption.media[0]
            }
          }
        }
      }
      this.setState({
        featuredMedia,
        media: mediaList,
        selectedVariantId,
        selectedOptionId
      });
    }

    handleSelectFeaturedMedia = (media) => {
      this.setState({ featuredMedia: media });
    }

    handleSelectVariant = (variant, optionId) => {
      this.selectVariant(variant, optionId);
    }

    handleSelectOption = (option) => {
      const { catalogItemProduct: product } = this.props;
      const { selectedVariantId } = this.state;
      // If we are clicking an option, it must be for the current selected variant
      const variant = product.variants.find((vnt) => vnt.variantId === selectedVariantId);
      this.selectVariant(variant, option.variantId);
    };

    handleCartQuantityChange = (event, quantity) => {
      this.setState({
        cartQuantity: Math.max(quantity, 1)
      });
    };

    handleAddToCart = () => {
      const { addCartItems, cartId, createCart, catalogItemProduct: product, shop, shopId } = this.props;
      const { cartQuantity, selectedVariantId, selectedOptionId } = this.state;
      let selectedOption;
      const selectedVariant = product.variants.find((variant) => variant.variantId === selectedVariantId);
      if (selectedOptionId) {
        selectedOption = selectedVariant.options.find((option) => option.variantId === selectedOptionId);
      }
      if (selectedVariant && selectedVariant.options && !selectedOptionId) {
        Alerts.inline("Please choose an option before adding to cart", "warning", {
          placement: "productDetail",
          i18nKey: "productDetail.chooseOptions",
          autoHide: 10000
        });
        return;
      }

      const selectedVariantOrOption = selectedOption || selectedVariant;

      if (selectedVariantOrOption.isSoldOut) {
        Alerts.inline("Sorry, this item is out of stock!", "warning", {
          placement: "productDetail",
          i18nKey: "productDetail.outOfStock",
          autoHide: 10000
        });
        return;
      }

      // TODO: There needs to be some logic to check if customer added an item
      // with quantity greater than current quantity of an item

      const currencyCode = shop.currency.code;
      const currencyPricing = selectedVariantOrOption.pricing.find((pricing) => pricing.currency.code === currencyCode);
      const items = [{
        price: {
          amount: currencyPricing.price, // TODO: this should be picked by currency code
          currencyCode
        },
        productConfiguration: {
          productId: product.productId,
          productVariantId: selectedVariantOrOption.variantId
        },
        quantity: cartQuantity
      }];
      if (!cartId) {
        createCart({ variables: { input: { items, shopId } } });
      } else {
        addCartItems({ variables: { input: { items, cartId } } });
      }
    }

    getDisplayPriceOfSelectedVariantOrOption() {
      const { catalogItemProduct: product } = this.props;
      const { selectedVariantId, selectedOptionId } = this.state;
      if (!product) {
        return "";
      }
      if (!selectedVariantId) {
        return getDisplayPriceByCurrency(product.pricing);
      }
      const selectedVariant = product.variants.find((variant) => variant.variantId === selectedVariantId);
      if (!selectedOptionId) {
        return getDisplayPriceByCurrency(selectedVariant.pricing);
      }
      const selectedOption = selectedVariant.options.find((option) => option.variantId === selectedOptionId);
      return getDisplayPriceByCurrency(selectedOption.pricing);
    }

    render() {
      const { catalogItemProduct: product, isLoadingCatalogItemProduct: isLoading } = this.props;
      const { cartQuantity, media, featuredMedia, selectedVariantId, selectedOptionId } = this.state;

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
            cartQuantity={cartQuantity}
            displayPrice={displayPrice}
            media={media}
            featuredMedia={featuredMedia}
            tags={product.tags.nodes}
            template={template}
            onAddToCart={this.handleAddToCart}
            onCartQuantityChange={this.handleCartQuantityChange}
            onSelectFeaturedMedia={this.handleSelectFeaturedMedia}
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
  const variantId = Reaction.Router.getParam("variantId");

  onData(null, {
    productId,
    variantId
  });
}

registerComponent("ProductDetailCustomer", ProductDetailCustomer, [
  composeWithTracker(composer),
  withPrimaryShopId,
  withShop,
  withViewer,
  withAccountCart,
  withCatalogItemProduct,
  withAddCartItems,
  withCreateCart,
  wrapComponent
]);

// Decorate component and export
export default compose(
  composeWithTracker(composer),
  withPrimaryShopId,
  withShop,
  withViewer,
  withAccountCart,
  withCatalogItemProduct,
  withAddCartItems,
  withCreateCart,
  wrapComponent
)(ProductDetailCustomer);
