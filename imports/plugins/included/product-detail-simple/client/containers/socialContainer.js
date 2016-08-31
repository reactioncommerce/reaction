import React, { Component, PropTypes } from "react";
import { composeWithTracker } from "react-komposer";

import { ReactionProduct } from "/lib/api";
import { Reaction, i18next, Logger } from "/client/api";
import { Tags, Media } from "/lib/collections";
import { Social } from "../components";
import SocialContainer from "/imports/plugins/included/social/client/containers/socialContainer"

class ProductSocialContainer extends Component {
  render() {
    console.log(this.props);
    return (
      <SocialContainer {...this.props} />
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

  console.log(socialApps);

  let description

  if (typeof product.description === "string") {
    description = product.description.substring(0, 254)
  }

  onData(null, {
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
