import _ from "lodash";
import { Session } from "meteor/session";
import { Template } from "meteor/templating";
import { Reaction } from "/client/api";
import Logger from "/client/modules/logger";
import { ReactionProduct } from "/lib/api";
import Sortable from "sortablejs";

/**
 * productGrid helpers
 */

Template.productGrid.onCreated(function () {
  const profile = Meteor.user().profile;

  if (profile && profile.preferences && profile.preferences.gridItems) {
    let selectedProducts = profile.preferences.gridItems;

    if (_.isEmpty(selectedProducts)) {
      Reaction.hideActionView();
    } else {
      if (event.target.checked) {
        selectedProducts.push(event.target.value);
      } else {
        selectedProducts = _.without(selectedProducts, event.target.value);
      }

      // Save the selected items to the Session
      Session.set("productGrid/selectedProducts", _.uniq(selectedProducts));

      const products = Template.currentData().products;

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
  } else {
    Reaction.hideActionView();
  }
});

Template.productGrid.onRendered(function () {
  const instance = this;

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

Template.productGrid.events({
  "click [data-event-action=loadMoreProducts]": (event) => {
    event.preventDefault();
    loadMoreProducts();
  },
  "change input[name=selectProduct]": (event) => {
    let selectedProducts = Session.get("productGrid/selectedProducts");

    if (event.target.checked) {
      selectedProducts.push(event.target.value);
    } else {
      selectedProducts = _.without(selectedProducts, event.target.value);
    }

    // Save the selected items to the user profile, for use when returing to the grid view
    if (Meteor.user()) {
      Meteor.users.update(Meteor.userId(), {
        $set: {
          "profile.preferences.gridItems": selectedProducts
        }
      });
    }

    // Save the selected items to the Session
    Session.set("productGrid/selectedProducts", _.uniq(selectedProducts));

    const products = Template.currentData().products;

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
});

Template.productGrid.helpers({
  loadMoreProducts() {
    return Template.instance().state.equals("canLoadMoreProducts", true);
  },
  products() {
    return Template.currentData().products;
  }
});
