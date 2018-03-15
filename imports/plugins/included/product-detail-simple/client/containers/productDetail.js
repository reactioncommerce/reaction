import React, { Component } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { StyleRoot } from "radium";
import { compose } from "recompose";
import { Components, registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { $ } from "meteor/jquery";
import { Meteor } from "meteor/meteor";
import { ReactionProduct } from "/lib/api";
import { Reaction, i18next, Logger } from "/client/api";
import { Tags, Cart } from "/lib/collections";
import { ProductDetail } from "../components";
import { SocialContainer, VariantListContainer } from "./";
import { Media } from "/imports/plugins/core/files/client";

const wrapComponent = (Comp) => (
  class ProductDetailContainer extends Component {
    static propTypes = {
      media: PropTypes.arrayOf(PropTypes.object),
      product: PropTypes.object,
      storedCart: PropTypes.object
    }

    constructor(props) {
      super(props);

      this.animationTimeOut = null;
      this.textTimeOut = null;

      this.state = {
        cartQuantity: 1,
        productClick: 0
      };
    }

    componentDidMount() {
      this._isMounted = true;
    }

    componentWillUnmount() {
      this._isMounted = false;
    }

    handleCartQuantityChange = (event, quantity) => {
      this.setState({
        cartQuantity: Math.max(quantity, 1)
      });
    }

    handleAddToCart = () => {
      let productId;
      let quantity;
      let maxQuantity;
      let totalQuantity;
      let storedQuantity = 0;
      const currentVariant = ReactionProduct.selectedVariant();
      const currentProduct = ReactionProduct.selectedProduct();

      if (currentVariant) {
        if (currentVariant.ancestors.length === 1) {
          const options = ReactionProduct.getVariants(currentVariant._id);

          if (options.length > 0) {
            Alerts.inline("Please choose options before adding to cart", "warning", {
              placement: "productDetail",
              i18nKey: "productDetail.chooseOptions",
              autoHide: 10000
            });
            return [];
          }
        }

        if (currentVariant.inventoryPolicy && currentVariant.inventoryQuantity < 1) {
          Alerts.inline("Sorry, this item is out of stock!", "warning", {
            placement: "productDetail",
            i18nKey: "productDetail.outOfStock",
            autoHide: 10000
          });
          return [];
        }

        if (this.props.storedCart && this.props.storedCart.items) {
          this.props.storedCart.items.forEach((item) => {
            if (item.variants._id === currentVariant._id) {
              storedQuantity = item.quantity;
            }
          });
        }

        quantity = parseInt(this.state.cartQuantity, 10);
        totalQuantity = quantity + storedQuantity;
        maxQuantity = currentVariant.inventoryQuantity;

        if (quantity < 1) {
          quantity = 1;
        }

        if (currentVariant.inventoryPolicy && quantity > maxQuantity && storedQuantity < maxQuantity) {
          Alerts.inline("Your product quantity has been adjusted to the max quantity in stock", "warning", {
            placement: "productDetail",
            i18nKey: "admin.inventoryAlerts.adjustedQuantity",
            autoHide: 10000
          });
          quantity = maxQuantity - storedQuantity;
          totalQuantity = maxQuantity;
        }

        if (currentVariant.inventoryPolicy && totalQuantity > maxQuantity && storedQuantity < maxQuantity && quantity < maxQuantity) {
          Alerts.inline("Your product quantity has been adjusted to the max quantity in stock", "warning", {
            placement: "productDetail",
            i18nKey: "admin.inventoryAlerts.adjustedQuantity",
            autoHide: 10000
          });
          quantity = maxQuantity - storedQuantity;
          totalQuantity = maxQuantity;
        }

        if (currentVariant.inventoryPolicy && totalQuantity > maxQuantity) {
          Alerts.inline("Sorry, this item is out of stock!", "error", {
            placement: "productDetail",
            i18nKey: "productDetail.outOfStock",
            autoHide: 10000
          });
          return [];
        }

        if (!currentProduct.isVisible) {
          Alerts.inline("Publish product before adding to cart.", "error", {
            placement: "productDetail",
            i18nKey: "productDetail.publishFirst",
            autoHide: 10000
          });
        } else {
          productId = currentProduct._id;

          if (productId) {
            Meteor.call("cart/addToCart", productId, currentVariant._id, quantity, (error) => {
              if (error) {
                Logger.error(error, "Failed to add to cart.");
                return error;
              }
              // Reset cart quantity on success
              this.handleCartQuantityChange(null, 1);

              this.setState(({ productClick }) => ({
                productClick: productClick + 1
              }));

              return true;
            });
          }

          // template.$(".variant-select-option").removeClass("active");
          ReactionProduct.setCurrentVariant(null);
          // qtyField.val(1);
          // scroll to top on cart add
          $("html,body").animate({
            scrollTop: 0
          }, 0);
          // slide out label
          const addToCartText = i18next.t("productDetail.addedToCart");
          const addToCartTitle = currentVariant.title || "";
          // Grab and cache the width of the alert to be used in animation
          const alertWidth = $(".cart-alert").width();
          const direction = i18next.dir() === "rtl" ? "left" : "right";
          const oppositeDirection = i18next.dir() === "rtl" ? "right" : "left";
          if ($(".cart-alert").css("display") === "none") {
            $("#spin").addClass("hidden");
            $(".cart-alert-text").text(`${quantity} ${addToCartTitle} ${addToCartText}`);
            this.handleSlideOut(alertWidth, direction, oppositeDirection);
            this.animationTimeOut = setTimeout(() => {
              this.handleSlideIn(alertWidth, direction, oppositeDirection);
            }, 4000);
          } else {
            clearTimeout(this.textTimeOut);

            // hides text and display spinner
            $(".cart-alert-text").hide();
            $("#spin").removeClass("hidden");

            this.textTimeOut = setTimeout(() => {
              $("#spin").addClass("hidden");
              $(".cart-alert-text").text(`${this.state.productClick * quantity} ${addToCartTitle} ${addToCartText}`);
              $(".cart-alert-text").fadeIn("slow");
              if (this._isMounted) {
                this.setState({ productClick: 0 });
              }
            }, 2000);

            clearTimeout(this.animationTimeOut);
            this.animationTimeOut = setTimeout(() => {
              this.handleSlideIn(alertWidth, direction, oppositeDirection);
            }, 4000);
          }
        }
      } else {
        Alerts.inline("Select an option before adding to cart", "warning", {
          placement: "productDetail",
          i18nKey: "productDetail.selectOption",
          autoHide: 8000
        });
      }

      return null;
    }

    handleSlideOut(alertWidth, direction, oppositeDirection) {
      // Animate slide out
      return $(".cart-alert")
        .show()
        .css({
          [oppositeDirection]: "auto",
          [direction]: -alertWidth
        })
        .animate({
          [oppositeDirection]: "auto",
          [direction]: 0
        }, 600);
    }

    handleSlideIn(alertWidth, direction, oppositeDirection) {
      // Animate slide in
      return $(".cart-alert").animate({
        [oppositeDirection]: "auto",
        [direction]: -alertWidth
      }, {
        duration: 600,
        complete() {
          $(".cart-alert").hide();
        }
      });
    }

    handleProductFieldChange = (productId, fieldName, value) => {
      Meteor.call("products/updateProductField", productId, fieldName, value, (error) => {
        if (error) {
          Alerts.toast(error.message, "error");
          this.forceUpdate();
        }
      });
    }

    handleViewContextChange = (event, value) => {
      Reaction.Router.setQueryParams({ as: value });
    }

    handleDeleteProduct = () => {
      ReactionProduct.archiveProduct(this.props.product);
    }

    render() {
      const { media, product } = this.props;

      if (_.isEmpty(product)) {
        return (
          <Components.ProductNotFound />
        );
      }

      return (
        <StyleRoot>
          <Comp
            cartQuantity={this.state.cartQuantity}
            mediaGalleryComponent={<Components.MediaGallery media={media} />}
            onAddToCart={this.handleAddToCart}
            onCartQuantityChange={this.handleCartQuantityChange}
            onViewContextChange={this.handleViewContextChange}
            socialComponent={<SocialContainer />}
            topVariantComponent={<VariantListContainer />}
            onDeleteProduct={this.handleDeleteProduct}
            onProductFieldChange={this.handleProductFieldChange}
            {...this.props}
          />
        </StyleRoot>
      );
    }
  }
);

function composer(props, onData) {
  const tagSub = Meteor.subscribe("Tags");
  const shopIdOrSlug = Reaction.Router.getParam("shopSlug");
  const productId = Reaction.Router.getParam("handle");
  const variantId = ReactionProduct.selectedVariantId();
  const revisionType = Reaction.Router.getQueryParam("revision");
  const viewProductAs = Reaction.getUserPreferences("reaction-dashboard", "viewAs", "administrator");

  let productSub;
  if (productId) {
    productSub = Meteor.subscribe("Product", productId, shopIdOrSlug);
  }
  if (productSub && productSub.ready()
    && tagSub.ready() && Reaction.Subscriptions.Cart.ready()) {
    const product = ReactionProduct.setProduct(productId, variantId);
    if (Reaction.hasPermission("createProduct")) {
      if (!Reaction.getActionView() && Reaction.isActionViewOpen() === true) {
        Reaction.setActionView({
          template: "productAdmin",
          data: product
        });
      }
    }

    // Get the product tags
    if (product) {
      let tags;
      if (_.isArray(product.hashtags)) {
        tags = _.map(product.hashtags, (id) => Tags.findOne(id));
      }

      Meteor.subscribe("ProductMedia", product._id);

      let mediaArray = [];
      const selectedVariant = ReactionProduct.selectedVariant();

      if (selectedVariant) {
        // Find the media for the selected variant
        mediaArray = Media.findLocal({
          "metadata.variantId": selectedVariant._id
        }, {
          sort: {
            "metadata.priority": 1
          }
        });

        // If no media found, broaden the search to include other media from parents
        if (Array.isArray(mediaArray) && mediaArray.length === 0 && selectedVariant.ancestors) {
          // Loop through ancestors in reverse to find a variant that has media to use
          for (const ancestor of selectedVariant.ancestors.reverse()) {
            const media = Media.findLocal({
              "metadata.variantId": ancestor
            }, {
              sort: {
                "metadata.priority": 1
              }
            });

            // If we found some media, then stop here
            if (Array.isArray(media) && media.length) {
              mediaArray = media;
              break;
            }
          }
        }
      }

      let priceRange;
      if (selectedVariant && typeof selectedVariant === "object") {
        const childVariants = ReactionProduct.getVariants(selectedVariant._id);
        // when top variant has no child variants we display only its price
        if (childVariants.length === 0) {
          priceRange = selectedVariant.price;
        } else {
          // otherwise we want to show child variants price range
          priceRange = ReactionProduct.getVariantPriceRange();
        }
      }

      let productRevision;

      if (revisionType === "published") {
        productRevision = product.__published;
      }

      let editable;

      if (viewProductAs === "customer") {
        editable = false;
      } else {
        editable = Reaction.hasPermission(["createProduct"]);
      }

      const topVariants = ReactionProduct.getTopVariants();

      const storedCart = Cart.findOne();

      onData(null, {
        variants: topVariants,
        layout: product.template || "productDetailSimple",
        product: productRevision || product,
        priceRange,
        tags,
        media: mediaArray,
        editable,
        viewAs: viewProductAs,
        hasAdminPermission: Reaction.hasPermission(["createProduct"]),
        storedCart
      });
    } else {
      // onData must be called with composeWithTracker, or else the loading icon will show forever.
      onData(null, {});
    }
  }
}

registerComponent("ProductDetail", ProductDetail, [
  composeWithTracker(composer),
  wrapComponent
]);

// Decorate component and export
export default compose(
  composeWithTracker(composer),
  wrapComponent
)(ProductDetail);
