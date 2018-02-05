import { Components } from "@reactioncommerce/reaction-components";
import { $ } from "meteor/jquery";
import { Template } from "meteor/templating";
import { Reaction } from "/client/api";

Template.products.helpers({
  component() {
    return Components.Products;
  }
});

/**
 * products events
 */

Template.products.events({
  "click #productListView"() {
    $(".product-grid").hide();
    return $(".product-list").show();
  },
  "click #productGridView"() {
    $(".product-list").hide();
    return $(".product-grid").show();
  },
  "click .product-list-item"() {
    // go to new product
    Reaction.Router.go("product", {
      handle: this._id
    });
  }
});
