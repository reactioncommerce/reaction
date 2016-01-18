Template.productDetailTags.helpers({
  currentHashTag: function () {
    let product = selectedProduct();
    if (product) {
      if (product.handle) {
        if (product.handle === product.handle.toLowerCase()) {
          return true;
        }
      }
    }
  }
});

Template.productTagInputForm.helpers({
  hashtagMark: function () {
    const product = selectedProduct();
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
    return Meteor.call("products/setHandleTag", selectedProductId(), this
      ._id,
      function (error, result) {
        if (result) {
          return Router.go("/product", {
            _id: result
          });
        }
      });
  },
  "click .tag-input-group-remove": function () {
    return Meteor.call("products/removeProductTag", selectedProductId(),
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
      return Meteor.call("products/updateProductTags", selectedProductId(),
        val, this._id,
        function (error) {
          template.$(".tags-submit-new").val("").focus();
          if (error) {
            Alerts.add("Tag already exists, or is empty.",
              "danger", {
                autoHide: true
              });
            return false;
          }
        });
    }
  },
  "mousedown .tag-input-group-handle": function (event, template) {
    return template.$(".tag-edit-list").sortable("refresh");
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
        selectedProductId(), "hashtags", _.uniq(hashtagsList));
    }
  });
});
