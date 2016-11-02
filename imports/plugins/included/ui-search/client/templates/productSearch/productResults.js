import _ from "lodash";
import { Session } from "meteor/session";
import { Template } from "meteor/templating";
import { Reaction } from "/client/api";
import Logger from "/client/modules/logger";
import { ReactionProduct } from "/lib/api";
import Sortable from "sortablejs";
import { ProductSearch } from "/lib/collections";


/**
 * productGrid helpers
 */

 // filterItems = [{vendor: []}, {min: 0}, {max: 9999999}, {score: false}];
function filterResult() {
  const result = [];
  getProducts().filter((product) => {
    console.log(product);
    let match = false;
    filterItems.forEach(item => {
      match = false;
      const key = Object.keys(item).toString();
      switch (key) {
        case "vendor":
          match = vendorMatch(item[key], product[key]);
          break;
        case "min":
          match = priceMatch("min", product.price, item[key]);
          break;
        case "max":
          match = priceMatch("max", product.price, item[key]);
          break;
        case "score":
          match = scoreMatch(item[key], product[key]);
          break;
        default:
          match = false;
      }
      match ? result.push(product) : "";
    });
    // console.log("match", match);
    // return match ? product : "";
  });
  return result;
}

// Match for score
function scoreMatch(itemKey, productKey) {
  return productKey >= itemKey ? true : false;
}

// Match for price
function priceMatch(type, value, condition) {
  if (!value) {
    return false;
  }

  if (type === "min" && value.min >= condition) {
    return true;
  } else if (value.max <= condition) {
    return true;
  } else {
    return false;
  }
}

// Match for vendors
function vendorMatch(itemKey, productKey) {
  return (itemKey.includes(productKey.toString())) ?
    true : false;
}

// format of items {location: item} e.g {vendor: china}
function getProducts() {
  return ProductSearch.find().fetch();
}

Template.productResults.onCreated(function () {
  Session.set("productGrid/selectedProducts", []);
});

Template.productResults.onRendered(function () {
  const instance = this;
  filterItems = [{vendor: []}, {min: undefined}, {max: undefined}, {score: undefined}];

  if (Reaction.hasPermission("createProduct")) {
    const productSort = $(".product-grid-list")[0];

    this.sortable = Sortable.create(productSort, {
      group: "products",
      handle: ".product-grid-item",
      onUpdate() {
        const tag = ReactionProduct.getTag();

        instance.$(".product-grid-item")
          .toArray()
          .map((element, index) => {
            const productId = element.getAttribute("id");
            const position = {
              position: index,
              updatedAt: new Date()
            };

            Meteor.call("products/updateProductPosition", productId, position, tag,
              error => {
                if (error) {
                  Logger.warn(error);
                  throw new Meteor.Error(403, error);
                }
              });
          });

        Tracker.flush();
      }
    });
  }
});

Template.productResults.events({
  "click [data-event-action=loadMoreProducts]": (event) => {
    event.preventDefault();
    loadMoreProducts();
  },
  "change [data-event-action=filterSearch]": (event) => {
    // {vendor: [China, ireland]}
    const key = event.target.parentNode.id;
    const value = event.target.value;
    console.log("object length", filterItems.length);
    this.filterItems.forEach((item) => {
      let itemKey = Object.keys(item).toString();
      if (itemKey === key) {
        if (key === "vendor" && !item[itemKey].includes(value)) {
          item[itemKey].push(value);
        } else if (key === "vendor") {
          item[itemKey].splice(item[itemKey].indexOf(value), 1);
        } else {
          console.log("item", item["0"]);
            console.log("key", key);
          item[itemKey] = value;
        }
      }
    });
    //console.log(this.filterItems);
    console.log(filterResult());
    // console.log(ProductSearch.find().fetch());
    // console.log(event.target.value);
    // console.log(event.target.parentNode.id);
  },
  "change input[name=selectProduct]": (event) => {
    let selectedProducts = Session.get("productGrid/selectedProducts");

    if (event.target.checked) {
      selectedProducts.push(event.target.value);
    } else {
      selectedProducts = _.without(selectedProducts, event.target.value);
    }

    Session.set("productGrid/selectedProducts", _.uniq(selectedProducts));

    const productCursor = Template.currentData().products;

    if (productCursor) {
      const products = productCursor.fetch();

      const filteredProducts = _.filter(products, (product) => {
        return _.includes(selectedProducts, product._id);
      });

      Reaction.showActionView({
        label: "Product Settings",
        i18nKeyLabel: "productDetailEdit.productSettings",
        template: "productSettings",
        type: "product",
        data: {
          products: filteredProducts
        }
      });
    }
  }
});

Template.productResults.helpers({
  loadMoreProducts() {
    return Template.instance().state.equals("canLoadMoreProducts", true);
  },
  products() {
    return Template.currentData().products;
  }
});
