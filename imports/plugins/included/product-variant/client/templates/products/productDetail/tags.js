import { $ } from "meteor/jquery";
import { ReactionProduct } from "/lib/api";
import { Reaction } from "/client/api";
import { Tags } from "/lib/collections";

// load modules
require("jquery-ui");

Template.productDetailTags.helpers({
  tags: function () {
    const instance = this;
    return instance.tags;
  },
  currentHashTag: function () {
    let product = ReactionProduct.selectedProduct();
    if (product) {
      if (product.handle) {
        if (this.handle === product.handle.toLowerCase() || Reaction.getSlug(product.handle) === this.slug) {
          return true;
        }
      }
    }
  }
});

Template.productTagInputForm.helpers({
  hashtagMark: function () {
    const product = ReactionProduct.selectedProduct();
    if (product) {
      if (product.handle) {
        if (this.handle === product.handle.toLowerCase() || Reaction.getSlug(product.handle) === this.slug) {
          return "fa-bookmark";
        }
      }
      return "fa-bookmark-o";
    }
  }
});

Template.productTagInputForm.events({
  "click .tag-input-hashtag": function () {
    return Meteor.call("products/setHandleTag", ReactionProduct.selectedProductId(), this._id,
      function (error, result) {
        if (result) {
          return Reaction.Router.go("product", {
            handle: result
          });
        }
      });
  },
  "click .tag-input-group-remove": function () {
    return Meteor.call("products/removeProductTag", ReactionProduct.selectedProductId(),
      this._id);
  },
  "click .tags-input-select": function (event) {
    return $(event.currentTarget).autocomplete({
      delay: 0,
      autoFocus: true,
      source: function (request, response) {
        let datums = [];
        let slug = Reaction.getSlug(request.term);
        Tags.find({
          slug: new RegExp(slug, "i")
        }).forEach(function (tag) {
          return datums.push({
            label: tag.name
          });
        });
        return response(datums);
      }
    });
  },
  "focusout .tags-input-select": function (event, template) {
    let val = $(event.currentTarget).val();
    if (val) {
      return Meteor.call("products/updateProductTags", ReactionProduct.selectedProductId(),
        val, this._id,
        function (error) {
          template.$(".tags-submit-new").val("").focus();
          if (error) {
            Alerts.toast("Tag already exists, or is empty.", "error");
            return false;
          }
        });
    }
  },
  "mousedown .tag-input-group-handle": function () {
    return $(".tag-edit-list").sortable("refresh");
  }
});

Template.productTagInputForm.onRendered(function () {
  return $(".tag-edit-list").sortable({
    items: "> li",
    handle: ".tag-input-group-handle",
    update: function () {
      let hashtagsList = [];
      let uiPositions = $(this).sortable("toArray", {
        attribute: "data-tag-id"
      });
      for (let tag of uiPositions) {
        if (_.isEmpty(tag) === false) {
          hashtagsList.push(tag);
        }
      }
      return Meteor.call("products/updateProductField",
        ReactionProduct.selectedProductId(), "hashtags", _.uniq(hashtagsList));
    }
  });
});
