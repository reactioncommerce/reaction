(function() {
  Template.productDetailTags.helpers({
    currentHashTag: function() {
      var _ref;
      if (((_ref = selectedProduct()) != null ? _ref.handle : void 0) === this.name.toLowerCase()) {
        return true;
      }
    }
  });

  Template.productTagInputForm.helpers({
    hashtagMark: function() {
      var _ref;
      if (((_ref = selectedProduct()) != null ? _ref.handle : void 0) === this.name.toLowerCase()) {
        return "fa-bookmark";
      } else {
        return "fa-bookmark-o";
      }
    }
  });

  Template.productTagInputForm.events({
    'click .tag-input-hashtag': function(event, template) {
      return Meteor.call("products/setHandleTag", selectedProductId(), this._id, function(error, result) {
        if (result) {
          return Router.go("product", {
            "_id": result
          });
        }
      });
    },
    'click .tag-input-group-remove': function(event, template) {
      return Meteor.call("products/removeProductTag", selectedProductId(), this._id);
    },
    'click .tags-input-select': function(event, template) {
      return $(event.currentTarget).autocomplete({
        delay: 0,
        autoFocus: true,
        source: function(request, response) {
          var datums, slug;
          datums = [];
          slug = getSlug(request.term);
          Tags.find({
            slug: new RegExp(slug, "i")
          }).forEach(function(tag) {
            return datums.push({
              label: tag.name
            });
          });
          return response(datums);
        }
      });
    },
    'focusout .tags-input-select': function(event, template) {
      var currentTag, val;
      val = $(event.currentTarget).val();
      if (val) {
        currentTag = Session.get("currentTag");
        return Meteor.call("products/updateProductTags", selectedProductId(), val, this._id, currentTag, function(error, result) {
          template.$('.tags-submit-new').val('').focus();
          if (error) {
            Alerts.add("Tag already exists, duplicate add failed.", "danger", {
              autoHide: true
            });
            return false;
          }
        });
      }
    },
    'mousedown .tag-input-group-handle': function(event, template) {
      return template.$(".tag-edit-list").sortable("refresh");
    }
  });

  Template.productTagInputForm.onRendered(function() {
    return $(".tag-edit-list").sortable({
      items: "> li",
      handle: '.tag-input-group-handle',
      update: function(event, ui) {
        var hashtagsList, index, tag, uiPositions, _i, _len;
        hashtagsList = [];
        uiPositions = $(this).sortable("toArray", {
          attribute: "data-tag-id"
        });
        for (index = _i = 0, _len = uiPositions.length; _i < _len; index = ++_i) {
          tag = uiPositions[index];
          if (tag) {
            hashtagsList.push(tag);
          }
        }
        return Meteor.call("products/updateProductField", selectedProductId(), "hashtags", hashtagsList);
      }
    });
  });

}).call(this);
