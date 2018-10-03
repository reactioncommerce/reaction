import React, { Component } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { compose } from "recompose";
import { registerComponent } from "@reactioncommerce/reaction-components";
import { Session } from "meteor/session";
import { Reaction } from "/client/api";
import ProductGridItems from "../components/productGridItems";

const wrapComponent = (Comp) => (
  class ProductGridItemsContainer extends Component {
    static propTypes = {
      isSearch: PropTypes.bool,
      itemSelectHandler: PropTypes.func,
      product: PropTypes.object,
      unmountMe: PropTypes.func
    }

    productPath = () => {
      if (this.props.product) {
        let { handle } = this.props.product;

        if (this.props.product.__published) {
          ({ handle } = this.props.product.__published);
        }

        return Reaction.Router.pathFor("product", {
          hash: {
            handle
          }
        });
      }

      return "/";
    }

    isSelected = () => {
      if (Reaction.isPreview() === false) {
        return _.includes(Session.get("productGrid/selectedProducts"), this.props.product._id) ? "active" : "";
      }
      return false;
    }

    displayPrice = () => {
      if (this.props.product.price && this.props.product.price.range) {
        return this.props.product.price.range;
      }
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
        for (let i = _.min(indexes); i <= _.max(indexes); i += 1) {
          checkbox = items[i].querySelector("input[type=checkbox]");
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
      const handle = (product.__published && product.__published.handle) || product.handle;

      Reaction.Router.go("product", {
        handle
      });

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

      if (Reaction.hasPermission("createProduct") && Reaction.isPreview() === false) {
        if (this.props.isSearch) {
          let { handle } = product;
          if (product.__published) {
            ({ handle } = product.__published);
          }

          Reaction.Router.go("product", {
            handle
          });

          this.props.unmountMe();
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
      } else {
        const handle = (product.__published && product.__published.handle) || product.handle;

        Reaction.Router.go("product", {
          handle
        });

        if (this.props.isSearch) {
          this.props.unmountMe();
        }
      }
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
