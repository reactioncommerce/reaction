import _ from "lodash";
import React, { Component, PropTypes } from "react";
import { Session } from "meteor/session";
import { composeWithTracker } from "/lib/api/compose";
import { Reaction } from "/client/api";
import { ReactionProduct } from "/lib/api";
import { Media } from "/lib/collections";
import { SortableItem } from "/imports/plugins/core/ui/client/containers";
import ProductGridItems from "../components/productGridItems";

class ProductGridItemsContainer extends Component {
  static propTypes = {
    connectDragSource: PropTypes.func,
    connectDropTarget: PropTypes.func,
    itemSelectHandler: PropTypes.func,
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
    this.onDoubleClick = this.onDoubleClick.bind(this);
    this.onClick = this.onClick.bind(this);
  }

  productPath = () => {
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

  onDoubleClick = () => {
    const product = this.props.product;
    const handle = product.__published && product.__published.handle || product.handle;

    Reaction.Router.go("product", {
      handle: handle
    });

    Reaction.setActionView({
      i18nKeyLabel: "productDetailEdit.productSettings",
      label: "Product Settings",
      template: "ProductAdmin"
    });
  }

  onClick = (event) => {
    const product = this.props.product;

    if (Reaction.hasPermission("createProduct") && Reaction.isPreview() === false) {
      event.preventDefault();

      const isSelected = event.target.closest("li.product-grid-item.active");
      const list = document.getElementById("product-grid-list");

      if (isSelected) {
        // If product is already selected, and you are single clicking WITH command key, things whould happen
        if (event.metaKey || event.ctrlKey || event.shiftKey) {
          let checkbox = list.querySelector(`input[type=checkbox][value="${product._id}"]`);
          const items = document.querySelectorAll("li.product-grid-item");
          const activeItems = document.querySelectorAll("li.product-grid-item.active");
          const selected = activeItems.length;

          if (event.shiftKey && selected > 0) {
            const indexes = [
              items.index(checkbox.parents("li.product-grid-item")),
              items.index(activeItems[0]),
              items.index(activeItems[selected - 1])
            ];
            for (let i = _.min(indexes); i <= _.max(indexes); i++) {
              checkbox = $("input[type=checkbox]", items.get(i));
              if (checkbox.checked === false) {
                checkbox.checked === true;
              }
            }
          } else {
            checkbox.checked = !checkbox.checked;
          }
        }
      } else {
        if (event.metaKey || event.ctrlKey || event.shiftKey) {
          let checkbox = list.querySelector(`input[type=checkbox][value="${product._id}"]`);
          const items = document.querySelectorAll("li.product-grid-item");
          const activeItems = document.querySelectorAll("li.product-grid-item.active");
          const selected = activeItems.length;

          if (event.shiftKey && selected > 0) {
            const mama = document.querySelector(`li.product-grid-item[id="${product._id}"]`);
            const indexes = [
              items.index(mama),
              items.index(activeItems[0]),
              items.index(activeItems[selected - 1])
            ];
            for (let i = _.min(indexes); i <= _.max(indexes); i++) {
              checkbox = $("input[type=checkbox]", items.get(i));
              if (checkbox.checked === false) {
                checkbox.checked === true;
              }
            }
          } else {
            checkbox.checked = !checkbox.checked;
          }
        } else {
          const checkbox = list.querySelector(`input[type=checkbox][value="${product._id}"]`);
          Session.set("productGrid/selectedProducts", [product._id]);
          checkbox.checked = true;
          Reaction.showActionView({
            label: "Grid Settings",
            i18nKeyLabel: "gridSettingsPanel.title",
            template: "productSettings",
            type: "product",
            data: { products: [product] }
          });
        }
      }
    } else {
      event.preventDefault();
      const handle = product.__published && product.__published.handle || product.handle;

      Reaction.Router.go("product", {
        handle: handle
      });
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
        itemSelectHandler={this.props.itemSelectHandler}
        onDoubleClick={this.onDoubleClick}
        onClick={this.onClick}
        {...this.props}
      />
    );
  }
}

function composer(props, onData) {
  onData(null, {});
}

const container = composeWithTracker(composer)(ProductGridItemsContainer);
export default SortableItem("productGridItem", container);
