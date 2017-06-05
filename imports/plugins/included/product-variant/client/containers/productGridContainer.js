import _ from "lodash";
import { Session } from "meteor/session";
import React, { Component, PropTypes } from "react";
import { Reaction } from "/client/api";
import { composeWithTracker } from "/lib/api/compose";
import ProductGrid from "../components/productGrid";

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

  componentDidMount() {
    // sortable item init
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

  render() {
    return (
      <ProductGrid
        products={this.state.products}
        itemSelectHandler={this.handleSelectProductItem}
      />
    );
  }
}


function composer(props, onData) {
  onData(null, {});
}

export default composeWithTracker(composer)(ProductGridContainer);
