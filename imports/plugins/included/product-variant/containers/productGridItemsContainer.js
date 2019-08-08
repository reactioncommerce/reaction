import React, { Component } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { compose } from "recompose";
import { registerComponent } from "@reactioncommerce/reaction-components";
import { Session } from "meteor/session";
import { Reaction } from "/client/api";
import { Catalog } from "/lib/api";
import ProductGridItems from "../components/productGridItems";

const wrapComponent = (Comp) => (
  class ProductGridItemsContainer extends Component {
    static propTypes = {
      isSearch: PropTypes.bool,
      itemSelectHandler: PropTypes.func,
      onSelectAllProducts: PropTypes.func,
      product: PropTypes.object,
      unmountMe: PropTypes.func
    }

    productPath = () => {
      if (this.props.product) {
        let { handle } = this.props.product;

        if (this.props.product.__published) {
          ({ handle } = this.props.product.__published);
        }
        return `/operator/products/${handle}`;
      }

      return "/";
    }

    isSelected = () => (_.includes(Session.get("productGrid/selectedProducts"), this.props.product._id) ? "active" : "")

    displayPrice = () => {
      const { product } = this.props;
      return Catalog.getProductPriceRange(product._id).range;
    }

    handleCheckboxSelect = (list, product) => {
      let checkbox = list.querySelector(`input[type=checkbox][value="${product._id}"]`);
      const items = document.querySelectorAll("li.product-grid-item");
      const activeItems = document.querySelectorAll("li.product-grid-item.active");
      const selected = activeItems.length;

      if (event.shiftKey && selected > 0) {
        const indexes = [
          Array.prototype.indexOf.call(items, document.querySelector(`li.product-grid-item[id="${product._id}"]`)),
          Array.prototype.indexOf.call(items, activeItems[0]),
          Array.prototype.indexOf.call(items, activeItems[selected - 1])
        ];
        for (let inc = _.min(indexes); inc <= _.max(indexes); inc += 1) {
          checkbox = items[inc].querySelector("input[type=checkbox]");
          if (checkbox.checked === false) {
            checkbox.checked = true;
            this.props.itemSelectHandler(checkbox.checked, product._id);
          }
        }
      } else if (checkbox) {
        checkbox.checked = !checkbox.checked;
        this.props.itemSelectHandler(checkbox.checked, product._id);
      }
    }

    onDoubleClick = () => {
      const { product } = this.props;

      Reaction.Router.go(`/operator/products/${product._id}`);

      // Open actionView to productDetails panel
      Reaction.state.set("edit/focus", "productDetails");

      Reaction.setActionView({
        i18nKeyLabel: "productDetailEdit.productSettings",
        label: "Product Settings",
        template: "ProductAdmin"
      });

      if (this.props.isSearch) {
        this.props.unmountMe();
      }
    }

    onClick = (event) => {
      event.preventDefault();
      const { product } = this.props;

      if (this.props.isSearch) {
        Reaction.Router.go(`/operator/products/${product._id}`);
        this.props.unmountMe();
        return;
      }

      const isSelected = event.target.closest("li.product-grid-item.active");
      const list = document.getElementById("product-grid-list");

      if (isSelected) {
        // If a product is already selected, and you are single clicking on another product(s)
        // WITH command key, the product(s) are added to the selected products Session array
        this.handleCheckboxSelect(list, product);
        if (event.metaKey || event.ctrlKey || event.shiftKey) {
          this.handleCheckboxSelect(list, product);
        }
      } else if (event.metaKey || event.ctrlKey || event.shiftKey) {
        this.handleCheckboxSelect(list, product);
      } else {
        const checkbox = list.querySelector(`input[type=checkbox][value="${product._id}"]`);
        Session.set("productGrid/selectedProducts", []);
        if (checkbox) {
          checkbox.checked = true;
          this.props.itemSelectHandler(checkbox.checked, product._id);
        }
      }
    }

    handleSelect = (isChecked, product) => {
      this.props.itemSelectHandler(isChecked, product._id);
    }

    render() {
      return (
        <Comp
          product={this.props.product}
          pdpPath={this.productPath}
          isSelected={this.isSelected}
          displayPrice={this.displayPrice}
          onDoubleClick={this.onDoubleClick}
          onClick={this.onClick}
          onSelect={this.handleSelect}
          onSelectAllProducts={this.props.onSelectAllProducts}
          {...this.props}
        />
      );
    }
  }
);

registerComponent("ProductGridItems", ProductGridItems, [
  wrapComponent
]);

export default compose(wrapComponent)(ProductGridItems);
