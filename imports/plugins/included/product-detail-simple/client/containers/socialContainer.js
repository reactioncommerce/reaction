import React, { Component, PropTypes } from "react";
import { composeWithTracker } from "react-komposer";

import { ReactionProduct } from "/lib/api";
import { Reaction, i18next, Logger } from "/client/api";
import { Tags, Media } from "/lib/collections";
import { Social } from "../components";


class SocialContainer extends Component {
  render() {
    console.log(this.props);
    return (
      <Social {...this.props} />
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

  onData(null, {
    socialApps: socialApps,
    placement: "productDetail",
    faClass: "",
    faSize: "fa-lg",
    media: Session.get("variantImgSrc"),
    url: window.location.href,
    title: title || "",
    description: typeof product.description === "string" ? product.description.substring(0, 254) : void 0,
    apps: {
      facebook: {
        description: product.facebookMsg
      },
      twitter: {
        title: product.twitterMsg
      },
      googleplus: {
        itemtype: "Product",
        description: product.googleplusMsg
      },
      pinterest: {
        description: product.pinterestMsg
      }
    }
  });
}

export default composeWithTracker(composer)(SocialContainer);
