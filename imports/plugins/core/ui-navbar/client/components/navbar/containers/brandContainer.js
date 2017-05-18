import React, { Component, PropTypes } from "react";
import { Meteor } from "meteor/meteor";
import { Reaction } from "/client/api";
import { composeWithTracker } from "/lib/api/compose";
import { Media, Shops } from "/lib/collections";
import Brand from "../components/brand";

class BrandContainer extends Component {
  static propTypes = {
    shop: PropTypes.object
  }

  logo() {
    if (_.isArray(this.props.shop.brandAssets)) {
      const brandAsset = _.find(this.props.shop.brandAssets, (asset) => asset.type === "navbarBrandImage");
      return Media.findOne(brandAsset.mediaId);
    }
    return false;
  }

  render() {
    return (
      <div>
        <Brand
          logo={this.logo()}
          {...this.props}
        />
      </div>
    );
  }
}

const composer = (props, onData) => {
  const mediaSub = Meteor.subscribe("Media");
  const shopSub = Meteor.subscribe("Shops");

  if (mediaSub.ready() && shopSub.ready()) {
    const shop = Shops.findOne(Reaction.getShopId());

    onData(null, {
      shop: shop
    });
  }
};

export default composeWithTracker(composer, null)(BrandContainer);
