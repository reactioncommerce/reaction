import React, { Component } from "react";
import PropTypes from "prop-types";
import { composeWithTracker } from "@reactioncommerce/reaction-components";
import { getPrimaryMediaForItem, ReactionProduct } from "/lib/api";
import SocialButtons from "/imports/plugins/included/social/client/components/socialButtons";
import { createSocialSettings } from "/imports/plugins/included/social/lib/helpers";
import { EditContainer } from "/imports/plugins/core/ui/client/containers";

class ProductSocialContainer extends Component {
  render() {
    return (
      <EditContainer
        data={this.props.data}
        editView="ProductAdmin"
        field={["facebookMsg", "twitterMsg", "googleplusMsg", "pinterestMsg"]}
        i18nKeyLabel="productDetailEdit.editSocial"
        label="Edit Social Messaging"
        permissions={["createProduct"]}
      >
        <SocialButtons {...this.props.socialSettings} />
      </EditContainer>
    );
  }
}

function composer(props, onData) {
  const product = ReactionProduct.selectedProduct() || {};
  const selectedVariant = ReactionProduct.selectedVariant() || {};
  let { title } = product;
  let mediaUrl;

  if (selectedVariant) {
    ({ title } = selectedVariant);
  }

  let description;

  if (typeof product.description === "string") {
    description = product.description.substring(0, 254);
  }

  const media = getPrimaryMediaForItem({
    productId: product._id,
    variantId: selectedVariant && selectedVariant._id
  });

  if (media) {
    mediaUrl = media.url({ store: "large" });
  }

  const options = {
    data: product,
    title: product.title,
    description,
    placement: "productDetail",
    buttonClassName: "fa-lg",
    media: mediaUrl,
    apps: {
      facebook: {
        description: product.facebookMsg || description,
        media: mediaUrl
      },
      twitter: {
        description: product.twitterMsg || title,
        media: mediaUrl
      },
      googleplus: {
        itemtype: "Product",
        description: product.googleplusMsg || description,
        media: mediaUrl
      },
      pinterest: {
        description: product.pinterestMsg || description,
        media: mediaUrl
      }
    }
  };

  const socialSettings = createSocialSettings(options);

  onData(null, {
    data: product,
    socialSettings
  });
}

ProductSocialContainer.propTypes = {
  data: PropTypes.object,
  socialSettings: PropTypes.object
};

export default composeWithTracker(composer)(ProductSocialContainer);
