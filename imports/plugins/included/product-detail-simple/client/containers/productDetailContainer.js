import React, { Component, PropTypes } from "react";
import { composeWithTracker } from "react-komposer";
import { Meteor } from "meteor/meteor";
import { ReactionProduct } from "/lib/api";
import { Reaction, i18next, Logger } from "/client/api";
import { Tags, Media } from "/lib/collections";
import { Loading } from "/imports/plugins/core/ui/client/components";
import { ProductDetail } from "../components";
import { SocialContainer, VariantListContainer } from "./";
import { MediaGalleryContainer } from "/imports/plugins/core/ui/client/containers";
import { DragDropProvider, TranslationProvider } from "/imports/plugins/core/ui/client/providers";

class ProductDetailContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      cartQuantity: 1
    };
  }

  handleCartQuantityChange = (event, quantity) => {
    this.setState({
      cartQuantity: Math.max(quantity, 1)
    });
  }

  handleAddToCart = () => {
    let productId;
    let quantity;
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

      quantity = parseInt(this.state.cartQuantity, 10);

      if (quantity < 1) {
        quantity = 1;
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
              Logger.error("Failed to add to cart.", error);
              return error;
            }
            // Reset cart quantity on success
            this.handleCartQuantityChange(null, 1);

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
        $(".cart-alert-text").text(`${quantity} ${addToCartTitle} ${addToCartText}`);

        // Grab and cache the width of the alert to be used in animation
        const alertWidth = $(".cart-alert").width();
        const direction = i18next.dir() === "rtl" ? "left" : "right";
        const oppositeDirection = i18next.dir() === "rtl" ? "right" : "left";

        // Animate
        return $(".cart-alert")
          .show()
          .css({
            [oppositeDirection]: "auto",
            [direction]: -alertWidth
          })
          .animate({
            [oppositeDirection]: "auto",
            [direction]: 0
          }, 600)
          .delay(4000)
          .animate({
            [oppositeDirection]: "auto",
            [direction]: -alertWidth
          }, {
            duration: 600,
            complete() {
              $(".cart-alert").hide();
            }
          });
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

  handleProductFieldChange = (productId, fieldName, value) => {
    Meteor.call("products/updateProductField", productId, fieldName, value);
  }

  handleViewContextChange = (event, value) => {
    Reaction.Router.setQueryParams({as: value});
  }

  handleDeleteProduct = () => {
    ReactionProduct.maybeDeleteProduct(this.props.product);
  }

  render() {
    return (
      <TranslationProvider>
        <DragDropProvider>
          <ProductDetail
            cartQuantity={this.state.cartQuantity}
            mediaGalleryComponent={<MediaGalleryContainer media={this.props.media} />}
            onAddToCart={this.handleAddToCart}
            onCartQuantityChange={this.handleCartQuantityChange}
            onViewContextChange={this.handleViewContextChange}
            socialComponent={<SocialContainer />}
            topVariantComponent={<VariantListContainer />}
            onDeleteProduct={this.handleDeleteProduct}
            onProductFieldChange={this.handleProductFieldChange}
            {...this.props}
          />
        </DragDropProvider>
      </TranslationProvider>
    );
  }
}

ProductDetailContainer.propTypes = {
  media: PropTypes.arrayOf(PropTypes.object),
  product: PropTypes.object
};

function composer(props, onData) {
  const tagSub = Meteor.subscribe("Tags");
  const productId = Reaction.Router.getParam("handle");
  const variantId = Reaction.Router.getParam("variantId");
  const revisionType = Reaction.Router.getQueryParam("revision");
  const viewProductAs = Reaction.Router.getQueryParam("as");

  let productSub;

  if (productId) {
    productSub = Meteor.subscribe("Product", productId);
  }

  if (productSub && productSub.ready() && tagSub.ready()) {
    // Get the product
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
        tags = _.map(product.hashtags, function (id) {
          return Tags.findOne(id);
        });
      }

      let mediaArray = [];
      const selectedVariant = ReactionProduct.selectedVariant();

      if (selectedVariant) {
        mediaArray = Media.find({
          "metadata.variantId": selectedVariant._id
        }, {
          sort: {
            "metadata.priority": 1
          }
        }).fetch();
      }

      let priceRange;
      if (selectedVariant && typeof selectedVariant === "object") {
        const childVariants = ReactionProduct.getVariants(selectedVariant._id);
        // when top variant has no child variants we display only its price
        if (childVariants.length === 0) {
          priceRange = selectedVariant.price;
        }
        // otherwise we want to show child variants price range
        priceRange = ReactionProduct.getVariantPriceRange();
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

      onData(null, {
        product: productRevision || product,
        priceRange,
        tags,
        media: mediaArray,
        editable,
        viewAs: viewProductAs,
        hasAdminPermission: Reaction.hasPermission(["createProduct"])
      });
    }
  }
}

// Decorate component and export
export default composeWithTracker(composer, Loading)(ProductDetailContainer);
