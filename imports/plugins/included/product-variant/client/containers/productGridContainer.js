import _ from "lodash";
import { Session } from "meteor/session";
import React, { Component, PropTypes } from "react";
import { Reaction } from "/client/api";
import { composeWithTracker } from "/lib/api/compose";
import ProductGrid from "../components/productGrid";
import { DragDropProvider } from "/imports/plugins/core/ui/client/providers";



class ProductGridContainer extends Component {
  static propTypes = {
    products: PropTypes.object
  }

  constructor(props) {
    super(props);
    this.state = {
      products: props.products.get(),
      initialLoad: true,
      slug: "",
      canLoadMoreProducts: false
    };
  }

  componentWillMount() {
    const selectedProducts = Reaction.getUserPreferences("reaction-product-variant", "selectedGridItems");
    const products = this.state.products;

    if (_.isEmpty(selectedProducts)) {
      return Reaction.hideActionView();
    }

    // Save the selected items to the Session
    Session.set("productGrid/selectedProducts", _.uniq(selectedProducts));

    if (products) {
      const filteredProducts = _.filter(products, (product) => {
        return _.includes(selectedProducts, product._id);
      });

      if (Reaction.isPreview() === false) {
        Reaction.showActionView({
          label: "Grid Settings",
          i18nKeyLabel: "gridSettingsPanel.title",
          template: "productSettings",
          type: "product",
          data: { products: filteredProducts }
        });
      }
    }
  }

  handleSelectProductItem = (event) => {
    let selectedProducts = Session.get("productGrid/selectedProducts");

    if (event.target.checked) {
      selectedProducts.push(event.target.value);
    } else {
      selectedProducts = _.without(selectedProducts, event.target.value);
    }

    Reaction.setUserPreferences("reaction-product-variant", "selectedGridItems", selectedProducts);

    // Save the selected items to the Session
    Session.set("productGrid/selectedProducts", _.uniq(selectedProducts));

    const products = this.state.products;

    if (products) {
      const filteredProducts = _.filter(products, (product) => {
        return _.includes(selectedProducts, product._id);
      });

      Reaction.showActionView({
        label: "Grid Settings",
        i18nKeyLabel: "gridSettingsPanel.title",
        template: "productSettings",
        type: "product",
        data: {
          products: filteredProducts
        }
      });
    }
  }

  onMove = (dragIndex, hoverIndex) => {
    console.log('dragging...', { dragIndex, hoverIndex });
    const productId = element.getAttribute("id");
    const position = {
      position: index,
      updatedAt: new Date()
    };

    Meteor.call("products/updateProductPosition", productId, position, tag, error => {
      if (error) {
        Logger.warn(error);
        throw new Meteor.Error(403, error);
      }
    });
  }

  render() {
    return (
      <DragDropProvider>
        <ProductGrid
          products={this.state.products}
          onMove={this.onMove}
          onDrag={this.onMove}
          itemSelectHandler={this.handleSelectProductItem}
        />
      </DragDropProvider>
    );
  }
}


function composer(props, onData) {
  onData(null, {});
}

export default composeWithTracker(composer)(ProductGridContainer);
