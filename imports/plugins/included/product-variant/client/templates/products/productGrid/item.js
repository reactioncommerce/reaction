import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { Session } from "meteor/session";
import { Template } from "meteor/templating";
import { Tracker } from "meteor/tracker";
import { $ } from "meteor/jquery";
import { Reaction } from "/client/api";
import Logger from "/client/modules/logger";
import { ReactionProduct } from "/lib/api";
import { Media } from "/lib/collections";
import { isRevisionControlEnabled } from "/imports/plugins/core/revisions/lib/api";


Template.productGridItems.onRendered(function () {
  $(".page > main").on("click", function (event) {
    // Do nothing if we are in preview mode
    if (Reaction.isPreview() === false) {
      // Don't trigger the clear selectiion if we're clicking on a grid item.
      if ($(event.target).closest(".product-grid-item").length === 0) {
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
  });
});

Template.productGridItems.onDestroyed(function () {
  $(".page > main").off("click");
});

/**
 * productGridItems helpers
 */

Template.productGridItems.helpers({
  pdpPath() {
    const instance = Template.instance();
    const product = instance.data;

    if (product) {
      let handle = product.handle;

      if (product.__published) {
        handle = product.__published.handle;
      }

      return Reaction.Router.pathFor("product", {
        hash: {
          handle
        }
      });
    }

    return "/";
  },

  controlProps() {
    const instance = Template.instance();

    return {
      product: instance.data,
      onEditButtonClick() {
        const data = instance.data;

        const $checkbox = instance.$(`input[type=checkbox][value=${data._id}]`);

        Session.set("productGrid/selectedProducts", []);
        $checkbox.prop("checked", true).trigger("change");
      },
      onPublishButtonClick() {
        if (isRevisionControlEnabled()) {
          Meteor.call("products/updateProductField", instance.data._id, "isVisible", !instance.data.isVisible);
        } else {
          ReactionProduct.publishProduct(instance.data);
        }
      }
    };
  },
  media: function () {
    const media = Media.findOne({
      "metadata.productId": this._id,
      "metadata.toGrid": 1
    }, {
      sort: { "metadata.priority": 1, "uploadedAt": 1 }
    });

    return media instanceof FS.File ? media : false;
  },
  additionalMedia: function () {
    const mediaArray = Media.find({
      "metadata.productId": this._id,
      "metadata.priority": {
        $gt: 0
      },
      "metadata.toGrid": 1
    }, { limit: 3 });

    if (mediaArray.count() > 1) {
      return mediaArray;
    }

    return false;
  },
  weightClass: function () {
    const tag = ReactionProduct.getTag();
    const positions = this.positions && this.positions[tag] || {};
    const weight = positions.weight || 0;
    switch (weight) {
      case 1:
        return "product-medium";
      case 2:
        return "product-large";
      default:
        return "product-small";
    }
  },
  isSelected: function () {
    if (Reaction.isPreview() === false) {
      return _.includes(Session.get("productGrid/selectedProducts"), this._id) ? "active" : "";
    }
    return false;
  },
  isMediumWeight: function () {
    const tag = ReactionProduct.getTag();
    const positions = this.positions && this.positions[tag] || {};
    const weight = positions.weight || 0;

    return weight === 1;
  },
  isLargeWeight: function () {
    const tag = ReactionProduct.getTag();
    const positions = this.positions && this.positions[tag] || {};
    const weight = positions.weight || 0;

    return weight === 3;
  },
  // TODO is it used?
  shouldShowAdditionalImages: function () {
    if (this.isMediumWeight && this.mediaArray) {
      return true;
    }
    return false;
  },
  // this is needed to get `pinned` from the item template
  positions() {
    const tag = ReactionProduct.getTag();
    return this.positions && this.positions[tag] || {};
  }
});

/**
 * productGridItems events
 */

Template.productGridItems.events({
  "dblclick [data-event-action=productClick]": function (event, template) {
    const instance = template;
    const product = instance.data;
    const handle = product.__published && product.__published.handle || product.handle;

    Reaction.Router.go("product", {
      handle: handle
    });

    Reaction.setActionView({
      i18nKeyLabel: "productDetailEdit.productSettings",
      label: "Product Settings",
      template: "ProductAdmin"
    });
  },
  "click [data-event-action=productClick]": function (event, template) {
    if (Reaction.hasPermission("createProduct") && Reaction.isPreview() === false) {
      event.preventDefault();

      const isSelected = $(event.target).closest("li.product-grid-item.active").length;

      if (isSelected) {
        // If product is already selected, and you are single clicking WITH command key, things whould happen
        if (event.metaKey || event.ctrlKey || event.shiftKey) {
          let $checkbox = template.$(`input[type=checkbox][value=${this._id}]`);
          const $items = $("li.product-grid-item");
          const $activeItems = $("li.product-grid-item.active");
          const selected = $activeItems.length;

          if (event.shiftKey && selected > 0) {
            const indexes = [
              $items.index($checkbox.parents("li.product-grid-item")),
              $items.index($activeItems.get(0)),
              $items.index($activeItems.get(selected - 1))
            ];
            for (let i = _.min(indexes); i <= _.max(indexes); i++) {
              $checkbox = $("input[type=checkbox]", $items.get(i));
              if ($checkbox.prop("checked") === false) {
                $checkbox.prop("checked", true).trigger("change");
              }
            }
          } else {
            $checkbox.prop("checked", !$checkbox.prop("checked")).trigger("change");
          }
        }
      } else {
        if (event.metaKey || event.ctrlKey || event.shiftKey) {
          let $checkbox = template.$(`input[type=checkbox][value=${this._id}]`);
          const $items = $("li.product-grid-item");
          const $activeItems = $("li.product-grid-item.active");
          const selected = $activeItems.length;

          if (event.shiftKey && selected > 0) {
            const indexes = [
              $items.index($checkbox.parents("li.product-grid-item")),
              $items.index($activeItems.get(0)),
              $items.index($activeItems.get(selected - 1))
            ];
            for (let i = _.min(indexes); i <= _.max(indexes); i++) {
              $checkbox = $("input[type=checkbox]", $items.get(i));
              if ($checkbox.prop("checked") === false) {
                $checkbox.prop("checked", true).trigger("change");
              }
            }
          } else {
            $checkbox.prop("checked", !$checkbox.prop("checked")).trigger("change");
          }
        } else {
          const $checkbox = template.$(`input[type=checkbox][value=${this._id}]`);

          Session.set("productGrid/selectedProducts", []);
          $checkbox.prop("checked", true).trigger("change");
        }
      }
    } else {
      event.preventDefault();

      const instance = template;
      const product = instance.data;
      const handle = product.__published && product.__published.handle || product.handle;

      Reaction.Router.go("product", {
        handle: handle
      });
    }
  },
  "click [data-event-action=selectSingleProduct]": function (event, template) {
    event.preventDefault();
    const { data } = Template.instance();

    const $checkbox = template.$(`input[type=checkbox][value=${data._id}]`);

    Session.set("productGrid/selectedProducts", []);
    $checkbox.prop("checked", true).trigger("change");
  },
  "click .publish-product"(event, instance) {
    ReactionProduct.publishProduct(instance.data);
  },
  "click .delete-product": function (event) {
    event.preventDefault();
    ReactionProduct.archiveProduct(this);
  },
  "click .update-product-weight": function (event) {
    event.preventDefault();

    const tag = ReactionProduct.getTag();
    const positions = this.positions && this.positions[tag] || {};
    let weight = positions.weight || 0;

    if (weight < 2) {
      weight++;
    } else {
      weight = 0;
    }

    const position = {
      weight: weight,
      updatedAt: new Date()
    };
    Meteor.call("products/updateProductPosition", this._id, position, tag, error => {
      if (error) {
        Logger.warn(error);
        throw new Meteor.Error(403, error);
      }
    });
    return Tracker.flush();
  }
});
