import React, { Component } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { StyleRoot } from "radium";
import { compose } from "recompose";
import { withRouter } from "react-router";
import { Components, registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { Catalog, ReactionProduct } from "/lib/api";
import { Reaction } from "/client/api";
import { Tags } from "/lib/collections";
import { ProductDetail } from "../components";
import { SocialContainer, VariantListContainer } from "./";
import { Media } from "/imports/plugins/core/files/client";

const wrapComponent = (Comp) =>
  class ProductDetailContainer extends Component {
    static propTypes = {
      media: PropTypes.arrayOf(PropTypes.object),
      product: PropTypes.object
    };

    constructor(props) {
      super(props);

      this.animationTimeOut = null;
      this.textTimeOut = null;

      this.state = {
        productClick: 0
      };
    }

    componentDidMount() {
      this._isMounted = true;
    }

    componentWillUnmount() {
      this._isMounted = false;
    }

    handleProductFieldChange = (productId, fieldName, value) => {
      Meteor.call("products/updateProductField", productId, fieldName, value, (error) => {
        if (error) {
          Alerts.toast(error.message, "error");
          this.forceUpdate();
        }
      });
    };

    handleDeleteProduct = () => {
      ReactionProduct.archiveProduct(this.props.product);
    };

    render() {
      const { media, product } = this.props;

      if (_.isEmpty(product)) {
        return <Components.ProductNotFound />;
      }

      return (
        <StyleRoot>
          <Comp
            mediaGalleryComponent={<Components.MediaGallery media={media} />}
            socialComponent={<SocialContainer />}
            topVariantComponent={<VariantListContainer />}
            onDeleteProduct={this.handleDeleteProduct}
            onProductFieldChange={this.handleProductFieldChange}
            {...this.props}
          />
        </StyleRoot>
      );
    }
  };

/**
 * @private
 * @param {Object} props Props
 * @param {Function} onData Call this to update props
 * @returns {undefined}
 */
function composer(props, onData) {
  const shopIdOrSlug = Reaction.Router.getParam("shopSlug");
  const productId = props.match.params.handle;
  const variantId = ReactionProduct.selectedVariantId();
  const revisionType = Reaction.Router.getQueryParam("revision");

  let productSub;
  if (productId) {
    productSub = Meteor.subscribe("Product", productId, shopIdOrSlug);
  }
  if (productSub && productSub.ready() && Reaction.Subscriptions.Cart && Reaction.Subscriptions.Cart.ready()) {
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
      const hashTags = product.hashtags || product.tagIds;
      if (_.isArray(hashTags)) {
        Meteor.subscribe("Tags", hashTags);
        tags = Tags.find({ _id: { $in: hashTags } }).fetch();
      }

      Meteor.subscribe("ProductMedia", product._id);

      let mediaArray = [];
      const selectedVariant = ReactionProduct.selectedVariant();

      if (selectedVariant) {
        // Find the media for the selected variant
        mediaArray = Media.findLocal(
          {
            "metadata.variantId": selectedVariant._id
          },
          {
            sort: {
              "metadata.priority": 1
            }
          }
        );

        // If no media found, broaden the search to include other media from parents
        if (Array.isArray(mediaArray) && mediaArray.length === 0 && selectedVariant.ancestors) {
          // Loop through ancestors in reverse to find a variant that has media to use
          for (const ancestor of selectedVariant.ancestors.reverse()) {
            const media = Media.findLocal(
              {
                "metadata.variantId": ancestor
              },
              {
                sort: {
                  "metadata.priority": 1
                }
              }
            );

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
          priceRange = Catalog.getVariantPriceRange(selectedVariant._id);
        }
      }

      let productRevision;

      if (revisionType === "published") {
        productRevision = product.__published;
      }

      const editable = Reaction.hasPermission(["createProduct"]);

      const topVariants = ReactionProduct.getTopVariants();

      onData(null, {
        variants: topVariants,
        layout: product.template || "productDetailSimple",
        product: productRevision || product,
        priceRange,
        tags,
        media: mediaArray,
        editable,
        hasAdminPermission: Reaction.hasPermission(["createProduct"])
      });
    } else {
      // onData must be called with composeWithTracker, or else the loading icon will show forever.
      onData(null, {});
    }
  }
}

registerComponent("ProductDetail", ProductDetail, [withRouter, composeWithTracker(composer), wrapComponent]);

// Decorate component and export
export default compose(withRouter, composeWithTracker(composer), wrapComponent)(ProductDetail);
