import React, { Component, PropTypes } from "react";
import { composeWithTracker } from "react-komposer";
import { ReactionProduct } from "/lib/api";
import { Reaction } from "/client/api";
import SocialContainer from "/imports/plugins/included/social/client/containers/socialContainer"
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
        <SocialContainer {...this.props} />
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

  onData(null, {
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
  });
}

ProductSocialContainer.propTypes = {
  data: PropTypes.object
};

export default composeWithTracker(composer)(ProductSocialContainer);
