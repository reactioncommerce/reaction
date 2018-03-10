import React, { Component } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { compose } from "recompose";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { Reaction } from "/client/api";
import { getPrimaryMediaForItem, ReactionProduct } from "/lib/api";
import { Tags, Templates } from "/lib/collections";
import { Countries } from "/client/collections";
import { ProductAdmin } from "../components";

const wrapComponent = (Comp) => (
  class ProductAdminContainer extends Component {
    static propTypes = {
      product: PropTypes.object,
      tags: PropTypes.arrayOf(PropTypes.object)
    }

    constructor(props) {
      super(props);

      this.state = {
        newMetafield: {
          key: "",
          value: ""
        }
      };
    }

    handleCardExpand = (cardName) => {
      Reaction.state.set("edit/focus", cardName);
    }

    handleDeleteProduct = (product) => {
      ReactionProduct.archiveProduct(product || this.product);
    }

    handleProductFieldSave = (productId, fieldName, value) => {
      let updateValue = value;
      // special case, slugify handles.
      if (fieldName === "handle") {
        updateValue = Reaction.getSlug(value);
      }
      Meteor.call("products/updateProductField", productId, fieldName, updateValue, (error) => {
        if (error) {
          Alerts.toast(error.message, "error");
          this.forceUpdate();
        }
      });
    }


    handleMetaChange = (metafield) => {
      const newState = {
        newMetafield: metafield
      };

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
        <Comp
          newMetafield={this.state.newMetafield}
          onCardExpand={this.handleCardExpand}
          onDeleteProduct={this.handleDeleteProduct}
          onMetaChange={this.handleMetaChange}
          onMetaRemove={this.handleMetaRemove}
          onMetaSave={this.handleMetafieldSave}
          onProductFieldSave={this.handleProductFieldSave}
          onRestoreProduct={this.handleProductRestore}
          {...this.props}
        />
      );
    }
  }
);

function composer(props, onData) {
  const product = ReactionProduct.selectedProduct();
  const editable = Reaction.hasAdminAccess();
  let tags;
  let media;
  let revisonDocumentIds;

  if (product) {
    if (_.isArray(product.hashtags)) {
      tags = _.map(product.hashtags, (id) => Tags.findOne(id));
    }

    const selectedVariant = ReactionProduct.selectedVariant();

    if (selectedVariant) {
      media = getPrimaryMediaForItem({
        productId: product._id,
        variantId: selectedVariant._id
      });
    }

    revisonDocumentIds = [product._id];

    const templates = Templates.find({
      parser: "react",
      provides: "template",
      templateFor: { $in: ["pdp"] },
      enabled: true
    }).map((template) => ({
      label: template.title,
      value: template.name
    }));

    const countries = Countries.find({}).fetch();

    onData(null, {
      editFocus: Reaction.state.get("edit/focus") || "productDetails",
      product,
      media,
      tags,
      revisonDocumentIds,
      templates,
      countries,
      editable
    });
  } else {
    onData(null, {
      editFocus: Reaction.state.get("edit/focus") || "productDetails"
    });
  }
}

registerComponent("ProductAdmin", ProductAdmin, [
  composeWithTracker(composer),
  wrapComponent
]);

// Decorate component and export
export default compose(
  composeWithTracker(composer),
  wrapComponent
)(ProductAdmin);
