import React, { Component } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { registerComponent } from "@reactioncommerce/reaction-components";
import { Reaction } from "/client/api";
import { Media } from "/lib/collections";

class Brand extends Component {
  static propTypes = {
    shop: PropTypes.object
  }
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(event) {
    event.preventDefault();
    Reaction.Router.go("/");
  }

  getLogo() {
    const { shop } = this.props;
    if (Array.isArray(shop.brandAssets)) {
      const brandAsset = _.find(shop.brandAssets, (asset) => asset.type === "navbarBrandImage");
      return Media.findOne(brandAsset.mediaId);
    }
    return false;
  }

  render() {
    const { shop } = this.props;
    return (
      <a className="brand" onClick={this.handleClick}>
        {this.getLogo() &&
          <div className="logo">
            <img src={this.getLogo().url()} />
          </div>
        }
        <span className="title">{shop.name}</span>
      </a>
    );
  }
}

registerComponent("Brand", Brand);

export default Brand;
