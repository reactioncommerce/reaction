import React, { Component } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { compose } from "recompose";
import { registerComponent } from "@reactioncommerce/reaction-components";
import { Session } from "meteor/session";
import { Reaction } from "/client/api";
import { ReactionProduct } from "/lib/api";
import { SortableItem } from "/imports/plugins/core/ui/client/containers";
import ProductGridItems from "../components/productGridItems";

const wrapComponent = (Comp) => (
  class ProductGridItemsContainer extends Component {
    static propTypes = {
      connectDragSource: PropTypes.func,
      connectDropTarget: PropTypes.func,
      isSearch: PropTypes.bool,
      itemSelectHandler: PropTypes.func,
      product: PropTypes.object,
      unmountMe: PropTypes.func
    }

    componentDidMount() {
      document.querySelector(".page > main").addEventListener("click", this.onPageClick);
    }

    componentWillUnmount() {
      document.querySelector(".page > main").removeEventListener("click", this.onPageClick);
    }

    onPageClick = (event) => {
      // Do nothing if we are in preview mode
      if (Reaction.isPreview() === false) {
        // Don't trigger the clear selection if we're clicking on a grid item.
        if (event.target.closest(".product-grid-item") === null) {
          const selectedProducts = Session.get("productGrid/selectedProducts");

          // Do we have any selected products?
          // If we do then lets reset the Grid Settings ActionView
          if (Array.isArray(selectedProducts) && selectedProducts.length) {
            // Reset sessions ver of selected products
            Session.set("productGrid/selectedProducts", []);

            // Reset the action view of selected products
            Reaction.setActionView({
              label: "Grid Settings",
              i18nKeyLabel: "gridSettingsPanel.title",
              template: "productSettings",
              type: "product",
              data: {}
            });
          }
        }
      }
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

    positions = () => {
      const tag = ReactionProduct.getTag();
      return (this.props.product.positions && this.props.product.positions[tag]) || {};
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

    isSelected = () => {
      if (Reaction.isPreview() === false) {
        return _.includes(Session.get("productGrid/selectedProducts"), this.props.product._id) ? "active" : "";
      }
      return false;
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
          positions={this.positions}
          weightClass={this.weightClass}
          isSelected={this.isSelected}
          isMediumWeight={this.isMediumWeight}
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
  SortableItem("productGridItem"),
  wrapComponent
]);

export default compose(
  SortableItem("productGridItem"),
  wrapComponent
)(ProductGridItems);
