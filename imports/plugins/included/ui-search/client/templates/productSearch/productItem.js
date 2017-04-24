import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { Session } from "meteor/session";
import { Template } from "meteor/templating";
import { Tracker } from "meteor/tracker";
import { $ } from "meteor/jquery";
import Logger from "/client/modules/logger";
import { ReactionProduct } from "/lib/api";
import { Media, Products } from "/lib/collections";
import { Reaction } from "/client/api";

/**
 * productGridItems helpers
 */

Template.productItem.helpers({
  controlProps() {
    const instance = Template.instance();

    return {
      product: instance.data,
      onEditButtonClick() {
        const data = instance.data.product;
        const $checkbox = instance.$(`input[type=checkbox][value=${data._id}]`);

        Session.set("productGrid/selectedProducts", []);
        $checkbox.prop("checked", true).trigger("change");
      },
      onPublishButtonClick() {
        ReactionProduct.publishProduct(instance.data);
      }
    };
  },
  media: function () {
    const media = Media.findOne({
      "metadata.productId": this.product._id,
      "metadata.priority": 0,
      "metadata.toGrid": 1
    }, { sort: { uploadedAt: 1 } });

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
    return _.includes(Session.get("productGrid/selectedProducts"), this._id) ? "active" : "";
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

Template.productItem.events({
  "click [data-event-action=productClick]": function (event) {
    event.preventDefault();
    const instance = Template.instance();
    const view = instance.view;
    const product = Products.findOne(event.currentTarget.dataset.eventValue);

    let handle = product.handle;
    if (product.__published) {
      handle = product.__published.handle;
    }

    Reaction.Router.go("product", {
      handle: handle
    });

    $(".js-search-modal").delay(400).fadeOut(400, () => {
      $("body").css("overflow-y", "inherit");
      Blaze.remove(view);
    });
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
