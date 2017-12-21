import React, { Component } from "react";
import PropTypes from "prop-types";
import update from "react/lib/update";
import _ from "lodash";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { Session } from "meteor/session";
import { Reaction } from "/client/api";
import Logger from "/client/modules/logger";
import { ReactionProduct } from "/lib/api";
import ProductGrid from "../components/productGrid";

const wrapComponent = (Comp) => (
  class ProductGridContainer extends Component {
    static propTypes = {
      canEdit: PropTypes.bool,
      isSearch: PropTypes.bool,
      productIds: PropTypes.array,
      products: PropTypes.array,
      productsByKey: PropTypes.object,
      unmountMe: PropTypes.func
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
      const products = this.products;

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

    componentWillReceiveProps = (nextProps) => {
      this.setState({
        products: nextProps.products,
        productIds: nextProps.productIds,
        productsByKey: nextProps.productsByKey
      });
    }

    handleSelectProductItem = (isChecked, productId) => {
      let selectedProducts = Session.get("productGrid/selectedProducts");

      if (isChecked) {
        selectedProducts.push(productId);
      } else {
        selectedProducts = _.without(selectedProducts, productId);
      }

      Reaction.setUserPreferences("reaction-product-variant", "selectedGridItems", selectedProducts);

      // Save the selected items to the Session
      Session.set("productGrid/selectedProducts", _.uniq(selectedProducts));

      const products = this.products;

      if (products) {
        const filteredProducts = _.filter(products, (product) => {
          return _.includes(selectedProducts, product._id);
        });

        Reaction.showActionView({
          label: "Grid Settings",
          i18nKeyLabel: "gridSettingsPanel.title",
          template: "productSettings",
          type: "product",
          data: { products: filteredProducts }
        });
      }
    }

    handleProductDrag = (dragIndex, hoverIndex) => {
      const newState = this.changeProductOrderOnState(dragIndex, hoverIndex);
      this.setState(newState, this.callUpdateMethod);
    }

    changeProductOrderOnState(dragIndex, hoverIndex) {
      const product = this.state.productIds[dragIndex];

      return update(this.state, {
        productIds: {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, product]
          ]
        }
      });
    }

    callUpdateMethod() {
      const tag = ReactionProduct.getTag();

      this.state.productIds.map((productId, index) => {
        const position = { position: index, updatedAt: new Date() };

        Meteor.call("products/updateProductPosition", productId, position, tag, error => {
          if (error) {
            Logger.error(error);
            throw new Meteor.Error("error-occurred", error);
          }
        });
      });
    }

    get products() {
      if (this.props.isSearch) {
        return this.state.products;
      }
      return this.state.productIds.map((id) => this.state.productsByKey[id]);
    }

    render() {
      return (
        <Components.DragDropProvider>
          <Comp
            products={this.products}
            onMove={this.handleProductDrag}
            itemSelectHandler={this.handleSelectProductItem}
            canEdit={this.props.canEdit}
            isSearch={this.props.isSearch}
            unmountMe={this.props.unmountMe}
          />
        </Components.DragDropProvider>
      );
    }
  }
);

registerComponent("ProductGrid", ProductGrid, wrapComponent);

export default wrapComponent(ProductGrid);
