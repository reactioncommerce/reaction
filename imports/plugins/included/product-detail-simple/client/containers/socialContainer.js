import React, { Component, PropTypes } from "react";
import { composeWithTracker } from "react-komposer";

import { ReactionProduct } from "/lib/api";
import { Reaction, i18next, Logger } from "/client/api";
import { Social } from "../components";
import SocialContainer from "/imports/plugins/included/social/client/containers/socialContainer"
import { EditContainer } from "/imports/plugins/core/ui/client/containers";
//["facebookMsg", "twitterMsg", "googleplusMsg", "pinterestMsg"]
class ProductSocialContainer extends Component {
  render() {
    return (
      <EditContainer
        data={this.props.data}
        editView="variantForm"

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
  const socialApps = Reaction.Apps({
    provides: "social",
    name: "reaction-social"
  });

  const product = ReactionProduct.selectedProduct();
  let title = product.title;
  if (ReactionProduct.selectedVariant()) {
    title = ReactionProduct.selectedVariant().title;
  }

  let description

  if (typeof product.description === "string") {
    description = product.description.substring(0, 254)
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
        description: product.twitterMsg || product.title.substring(0, 100)
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

  // onData(null, {
  //   socialApps: socialApps,
  //   placement: "productDetail",
  //   faClass: "",
  //   faSize: "fa-lg",
  //   media: Session.get("variantImgSrc"),
  //   url: window.location.href,
  //   title: title || "",
  //   description: typeof product.description === "string" ? product.description.substring(0, 254) : void 0,
  //   apps: {
  //     facebook: {
  //       description: product.facebookMsg
  //     },
  //     twitter: {
  //       title: product.twitterMsg
  //     },
  //     googleplus: {
  //       itemtype: "Product",
  //       description: product.googleplusMsg
  //     },
  //     pinterest: {
  //       description: product.pinterestMsg
  //     }
  //   }
  // });
}

export default composeWithTracker(composer)(ProductSocialContainer);
