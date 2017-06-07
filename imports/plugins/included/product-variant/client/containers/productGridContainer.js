import _ from "lodash";
import { Session } from "meteor/session";
import React, { Component, PropTypes } from "react";
import update from "react/lib/update";
import { Reaction } from "/client/api";
import { composeWithTracker } from "/lib/api/compose";
import ProductGrid from "../components/productGrid";
import { DragDropProvider } from "/imports/plugins/core/ui/client/providers";

class ProductGridContainer extends Component {
  static propTypes = {
    productIds: PropTypes.array,
    products: PropTypes.array,
    productsByKey: PropTypes.object
  }

  constructor(props) {
    super(props);

    this.state = {
      products: props.products,
      productsByKey: props.productsByKey,
      productIds: props.productIds,
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
    const product = this.state.productIds[dragIndex];

    console.log('dragging...', { dragIndex, hoverIndex, productIdonthatIndex: product });

    const newState = update(this.state, {
      productIds: {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, product]
        ]
      }
    });

    console.log(JSON.stringify({ newStatebyId: newState.productIds }, null, 4));

    this.setState(newState);
  }

  changeStateOnMove(dragStartIndex) {
  }

  updatecall() {
    this.state.products.map((product, index) => {

    });
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

    // Set local state so the component does't have to wait for a round-trip
    // to the server to get the updated list of variants
    this.setState(newState, () => {
      debounce(() => TagNavHelpers.onTagSort(this.state.tagIds), 500)(); // Save the updated positions
    });
  }

  get products() {
    return this.state.productIds.map((id) => this.state.productsByKey[id]);
  }

  render() {
    return (
      <DragDropProvider>
        <ProductGrid
          products={this.products}
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
