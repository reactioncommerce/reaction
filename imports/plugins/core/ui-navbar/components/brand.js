import React, { Component } from "react";
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
    return Shops.findOne(Reaction.getShopId());
  }

  getLogo() {
    if (_.isArray(this.getShop().brandAssets)) {
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
