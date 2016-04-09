const $ = require("jquery");
// load modules
require("jquery-ui/sortable");
require("jquery-ui/autocomplete");

Template.productDetailTags.helpers({
  tags: function () {
    const instance = this;
    return instance.tags;
  },
  currentHashTag: function () {
    let product = ReactionProduct.selectedProduct();
    if (product) {
      if (product.handle) {
        if (this.handle === product.handle.toLowerCase() || getSlug(product.handle) === this.slug) {
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
        if (this.handle === product.handle.toLowerCase() || getSlug(product.handle) === this.slug) {
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
          return ReactionRouter.go("product", {
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
        let slug = getSlug(request.term);
        ReactionCore.Collections.Tags.find({
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
