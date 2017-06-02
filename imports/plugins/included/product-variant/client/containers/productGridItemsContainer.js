import _ from "lodash";
import React, { Component, PropTypes } from "react";
import { Session } from "meteor/session";
import { composeWithTracker } from "/lib/api/compose";
import { Reaction } from "/client/api";
import { ReactionProduct } from "/lib/api";
import { Media } from "/lib/collections";
import ProductGridItems from "../components/productGridItems";

class ProductGridItemsContainer extends Component {
  static propTypes = {
    product: PropTypes.object
  }

  constructor() {
    super();

    this.productPath = this.productPath.bind(this);
    this.positions = this.positions.bind(this);
    this.weightClass = this.weightClass.bind(this);
    this.isSelected = this.isSelected.bind(this);
    this.productMedia = this.productMedia.bind(this);
    this.additionalProductMedia = this.additionalProductMedia.bind(this);
    this.isMediumWeight = this.isMediumWeight.bind(this);
    this.displayPrice = this.displayPrice.bind(this);
  }

  productPath = () => {
    console.log(this.props.product);

    if (this.props.product) {
      let handle = this.props.product.handle;

      if (this.props.product.__published) {
        handle = this.props.product.__published.handle;
      }

      return Reaction.Router.pathFor("product", {
        hash: {
          handle
        }
      });
    }

    return "/";
  }

  positions = () => {
    const tag = ReactionProduct.getTag();
    return this.props.product.positions && this.props.product.positions[tag] || {};
  }

  weightClass = () => {
    const positions = this.positions();
    const weight = positions.weight || 0;
    switch (weight) {
      case 1:
        return "product-medium";
      case 2:
        return "product-large";
      default:
        return "product-small";
    }
  }

  isSelected= () => {
    if (Reaction.isPreview() === false) {
      return _.includes(Session.get("productGrid/selectedProducts"), this.props.product._id) ? "active" : "";
    }
    return false;
  }

  productMedia = () => {
    const media = Media.findOne({
      "metadata.productId": this.props.product._id,
      "metadata.toGrid": 1
    }, {
      sort: { "metadata.priority": 1, "uploadedAt": 1 }
    });

    return media instanceof FS.File ? media : false;
  }

  additionalProductMedia = () => {
    const mediaArray = Media.find({
      "metadata.productId": this.props.product._id,
      "metadata.priority": {
        $gt: 0
      },
      "metadata.toGrid": 1
    }, { limit: 3 });

    return mediaArray.count() > 1 ? mediaArray : false;
  }

  isMediumWeight = () => {
    const positions = this.positions();
    const weight = positions.weight || 0;

    return weight === 1;
  }

  displayPrice = () => {
    if (this.props.product.price && this.props.product.price.range) {
      return this.props.product.price.range;
    }
  }

  render() {
    return (
      <ProductGridItems
        product={this.props.product}
        pdpPath={this.productPath}
        positions={this.positions}
        weightClass={this.weightClass}
        isSelected={this.isSelected}
        media={this.productMedia}
        additionalMedia={this.additionalProductMedia}
        isMediumWeight={this.isMediumWeight}
        displayPrice={this.displayPrice}
      />
    );
  }
}

function composer(props, onData) {
  const product = props;

  onData(null, {
    product
  });
}

export default composeWithTracker(composer)(ProductGridItemsContainer);
