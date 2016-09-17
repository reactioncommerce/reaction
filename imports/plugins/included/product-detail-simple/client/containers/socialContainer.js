import React, { Component, PropTypes } from "react";
import { composeWithTracker } from "react-komposer";
import { ReactionProduct } from "/lib/api";
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
  const product = ReactionProduct.selectedProduct();
  let title = product.title;

  if (ReactionProduct.selectedVariant()) {
    title = ReactionProduct.selectedVariant().title;
  }

  let description;

  if (typeof product.description === "string") {
    description = product.description.substring(0, 254);
  }

  const options = {
    data: product,
    title: product.title,
    description,
    placement: "productDetail",
    buttonClassName: "fa-lg",
    apps: {
      facebook: {
        description: product.facebookMsg || description
      },
      twitter: {
        description: product.twitterMsg || title
      },
      googleplus: {
        itemtype: "Product",
        description: product.googleplusMsg || description
      },
      pinterest: {
        description: product.pinterestMsg || description
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
