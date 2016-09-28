import React, { Component, PropTypes } from "react";
import update from "react/lib/update";
import { composeWithTracker } from "react-komposer";
import { ReactionProduct } from "/lib/api";
import { Tags, Media } from "/lib/collections";
import { ProductAdmin } from "../components";

class ProductAdminContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      product: props.product,
      newMetafield: {
        key: "",
        value: ""
      }
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      product: nextProps.product
    });
  }

  get product() {
    return this.state.product || this.props.product || {};
  }

  handleDeleteProduct = (product) => {
    ReactionProduct.maybeDeleteProduct(product || this.product);
  }

  handleFieldChange = (field, value) => {
    const newState = update(this.state, {
      product: {
        $merge: {
          [field]: value
        }
      }
    });

    this.setState(newState);
  }

  handleProductFieldSave = (productId, fieldName, value) => {
    Meteor.call("products/updateProductField", productId, fieldName, value);
  }


  handleMetaChange = (metafield, index) => {
    let newState = {};

    if (index >= 0) {
      newState = update(this.state, {
        product: {
          metafields: {
            [index]: {
              $set: metafield
            }
          }
        }
      });
    } else {
      newState = {
        newMetafield: metafield
      };
    }

    this.setState(newState);
  }

  handleMetafieldSave = (productId, metafield, index) => {
    // update existing metafield
    if (index >= 0) {
      Meteor.call("products/updateMetaFields", productId, metafield, index);
    } else if (metafield.key && metafield.value) {
      Meteor.call("products/updateMetaFields", productId, metafield);
    }

    this.setState({
      newMetafield: {
        key: "",
        value: ""
      }
    });
  }

  handleMetaRemove = (productId, metafield) => {
    Meteor.call("products/removeMetaFields", productId, metafield);
  }

  handleProductRestore = (product) => {
    Meteor.call("products/updateProductField", product._id, "isDeleted", false);
  }

  render() {
    return (
      <ProductAdmin
        newMetafield={this.state.newMetafield}
        onDeleteProduct={this.handleDeleteProduct}
        onFieldChange={this.handleFieldChange}
        onMetaChange={this.handleMetaChange}
        onMetaRemove={this.handleMetaRemove}
        onMetaSave={this.handleMetafieldSave}
        onProductFieldSave={this.handleProductFieldSave}
        onRestoreProduct={this.handleProductRestore}
        {...this.props}
        product={this.product}
        tags={this.props.tags}
      />
    );
  }
}


function composer(props, onData) {
  const product = ReactionProduct.selectedProduct();
  let tags;
  let media;
  let revisonDocumentIds;

  if (product) {
    if (_.isArray(product.hashtags)) {
      tags = _.map(product.hashtags, function (id) {
        return Tags.findOne(id);
      });
    }

    const selectedVariant = ReactionProduct.selectedVariant();

    if (selectedVariant) {
      media = Media.find({
        "metadata.variantId": selectedVariant._id
      }, {
        sort: {
          "metadata.priority": 1
        }
      });
    }

    revisonDocumentIds = [product._id];
  }

  onData(null, {
    product: product,
    media,
    tags,
    revisonDocumentIds
  });
}

ProductAdminContainer.propTypes = {
  product: PropTypes.object,
  tags: PropTypes.arrayOf(PropTypes.object)
};

// Decorate component and export
export default composeWithTracker(composer)(ProductAdminContainer);
