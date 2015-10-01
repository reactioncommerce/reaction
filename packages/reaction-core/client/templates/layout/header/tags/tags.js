/**
* tag helpers
*/

var currentTag, isEditing, isMovingTag, setEditing;

isMovingTag = false;

isEditing = function(id) {
  return Session.equals("isEditing-" + id, true);
};

setEditing = function(id, isEditing) {
  Session.set("isEditing-" + id, isEditing);
};

currentTag = function() {
  return Session.get("currentTag");
};

$(document).mouseup(function(e) {
  var container;
  container = $(".tag-edit-list");
  if (!isMovingTag && !container.is(e.target) && container.has(e.target).length === 0) {
    setEditing(currentTag(), false);
  }
});

/**
* headerTags helpers
*/

Template.headerTags.helpers({
  tagsComponent: function() {
    if (isEditing(currentTag()) && ReactionCore.hasOwnerAccess()) {
      return Template.tagInputForm;
    } else {
      return Template.headerLinks;
    }
  },
  tags: function() {
    var relatedTagId, relatedTagIds, tagDoc, tags, _i, _j, _len, _len1, _ref;
    if (this.tag) {
      tags = [];
      tagDoc = Tags.findOne(this.tag._id);
      if (!tagDoc) {
        Session.set("currentTag", "");
        return tags;
      }
      Session.set("currentTag", this.tag._id);
      tags.push(tagDoc);
      relatedTagIds = tagDoc.relatedTagIds;
      if (relatedTagIds) {
        for (_i = 0, _len = relatedTagIds.length; _i < _len; _i++) {
          relatedTagId = relatedTagIds[_i];
          tags.push(Tags.findOne(relatedTagId));
        }
      }
    } else {
      tags = Tags.find({
        isTopLevel: true
      }, {
        sort: {
          position: 1
        }
      }).fetch();
      Session.set("currentTag", "");
      if (this.tagIds) {
        _ref = this.tagIds;
        for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
          relatedTagId = _ref[_j];
          if (!(_.findWhere(tags, {
            _id: relatedTagId
          }))) {
            tags.push(Tags.findOne(relatedTagId));
          }
        }
      }
    }
    tags.sort(function(a, b) {
      return a.position - b.position;
    });
    return tags;
  }
});

/**
* headerLinks helpers
*/

Template.headerLinks.helpers({
  activeTag: function() {
    if (Session.equals("currentTag", this._id)) {
      return "active";
    }
  }
});

/**
* headerLinks events
*/

Template.headerLinks.events({
  'click #header-edit-tag': function(event, template) {
    setEditing(currentTag(), true);
    return Tracker.flush();
  }
});

/**
* tagInputForm helpers
*/

Template.tagInputForm.helpers({
  tags: function() {
    var tag, tagList, _i, _len, _ref;
    tagList = [];
    _ref = this.tags;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      tag = _ref[_i];
      tagList.push(tag._id);
    }
    return tagList.toString();
  }
});


/**
* tagInputForm events
*/

Template.tagInputForm.events({
  'click .tag-input-group-remove': function(event, template) {
    return Meteor.call("shop/removeHeaderTag", this._id, currentTag(), function(error, result) {
      if (error) {
        return Alerts.add("Tag is in use. It must be deleted from products first.", "warning", {
          autoHide: true
        });
      } else {
        return template.$('.tags-submit-new').focus();
      }
    });
  },
  'focusin .tags-input-select': function(event, template) {
    return $(event.currentTarget).autocomplete({
      delay: 0,
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
      },
      select: function(event, ui) {
        if (ui.item.value) {
          return Meteor.call("shop/updateHeaderTags", ui.item.value, this._id, currentTag(), function(error, result) {
            if (error) {
              return Alerts.add("Tag already exists, duplicate add failed.", "danger", {
                autoHide: true
              });
            } else {

            }
          });
        }
      }
    });
  },
  'focusout .tags-input-select': function(event, template) {
    var val;
    val = $(event.currentTarget).val();
    if (val) {
      return Meteor.call("shop/updateHeaderTags", val, this._id, currentTag(), function(error, result) {
        if (error) {
          Alerts.add("Tag already exists, duplicate add failed.", "danger", {
            autoHide: true
          });
        }
        return template.$('.tags-submit-new').val('').focus();
      });
    } else {

    }
  },
  'mousedown .tag-input-group-handle': function(event, template) {
    isMovingTag = true;
    Tracker.flush();
    return template.$(".tag-edit-list").sortable("refresh");
  }
});

/**
* tagInputForm onRendered
*/

Template.tagInputForm.onRendered(function() {
  return $(".tag-edit-list").sortable({
    items: "> li",
    axis: "x",
    handle: '.tag-input-group-handle',
    update: function(event, ui) {
      var index, tag, uiPositions, _i, _len, _results;
      uiPositions = $(this).sortable("toArray", {
        attribute: "data-tag-id"
      });
      _results = [];
      for (index = _i = 0, _len = uiPositions.length; _i < _len; index = ++_i) {
        tag = uiPositions[index];
        _results.push(Tags.update(tag, {
          $set: {
            position: index
          }
        }));
      }
      return _results;
    },
    stop: function(event, ui) {
      return isMovingTag = false;
    }
  });
});
