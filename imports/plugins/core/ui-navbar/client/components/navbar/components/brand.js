import React, { Component } from "react";
import _ from "lodash";
import { Reaction } from "/client/api";
import { Media, Shops } from "/lib/collections";

class Brand extends Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick = (event) => {
    event.preventDefault();
    Reaction.Router.go("/");
  }

  getShop() {
    // Default shopId is the primary shop
    let shopId = Reaction.getPrimaryShopId();

    // if marketplace is enabled and merchant theme is set to true
    // we should use the active shop
    if (Reaction.marketplace.merchantTheme) {
      shopId = Reaction.getShopId();
    }
    return Shops.findOne(shopId);
  }

  getLogo() {
    const shop = this.getShop();
    if (shop && _.isArray(shop.brandAssets)) {
      const brandAsset = _.find(this.getShop().brandAssets, (asset) => asset.type === "navbarBrandImage");
      return Media.findOne(brandAsset.mediaId);
    }
    return false;
  }

  render() {
    return (
      <a className="brand" onClick={this.handleClick}>
        {this.getLogo() &&
          <div className="logo">
            <img src={this.getLogo().url()} />
          </div>
        }
        <span className="title">{this.getShop().name}</span>
      </a>
    );
  }
}

export default Brand;
