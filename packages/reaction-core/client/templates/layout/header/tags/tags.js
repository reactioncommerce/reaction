/**
 * tag helpers
 */
let isMovingTag = false;

function isEditing(editId) {
  return Session.equals("isEditing-" + editId, true);
}

function setEditing(id, editState) {
  Session.set("isEditing-" + id, editState);
}

function currentTag() {
  return Session.get("currentTag");
}

$(document).mouseup(function (e) {
  let container;
  container = $(".tag-edit-list");
  if (!isMovingTag && !container.is(e.target) && container.has(e.target).length ===
    0) {
    setEditing(currentTag(), false);
  }
});

/**
 * headerTags helpers
 */

Template.headerTags.helpers({
  tagsComponent: function () {
    if (isEditing(currentTag()) && ReactionCore.hasOwnerAccess()) {
      return Template.tagInputForm;
    }
    return Template.headerLinks;
  },
  tags: function () {
    let tags = [];

    if (this.tag) {
      let tagDoc = ReactionCore.Collections.Tags.findOne(this.tag._id);

      if (!tagDoc) {
        Session.set("currentTag", "");
        return tags;
      }

      Session.set("currentTag", this.tag._id);
      tags.push(tagDoc);
      let relatedTagIds = tagDoc.relatedTagIds;

      if (relatedTagIds) {
        for (let relatedTagId of relatedTagIds) {
          tags.push(ReactionCore.Collections.Tags.findOne(relatedTagId));
        }
      }
    } else {
      tags = ReactionCore.Collections.Tags.find({
        isTopLevel: true
      }, {
        sort: {
          position: 1
        }
      }).fetch();
      Session.set("currentTag", "");
      if (this.tagIds) {
        for (let relatedTagId of this.tagIds) {
          if (!_.findWhere(tags, {
            _id: relatedTagId
          })) {
            tags.push(ReactionCore.Collections.Tags.findOne(relatedTagId));
          }
        }
      }
    }
    // there are cases where
    // we'll have no tags, and sort will error
    // so we check length for safety
    if (tags) {
      tags.sort(function (a, b) {
        return a.position - b.position;
      });
      return tags;
    }
  }
});

/**
 * headerLinks helpers
 */

Template.headerLinks.helpers({
  activeTag: function () {
    if (Session.equals("currentTag", this._id)) {
      return "active";
    }
  }
});

/**
 * headerLinks events
 */

Template.headerLinks.events({
  "click #header-edit-tag": function () {
    setEditing(currentTag(), true);
    return Tracker.flush();
  }
});

/**
 * tagInputForm helpers
 */

Template.tagInputForm.helpers({
  tags: function () {
    let tagList = [];
    for (let tag of this.tags) {
      tagList.push(tag._id);
    }
    return tagList.toString();
  }
});

/**
 * tagInputForm events
 */

Template.tagInputForm.events({
  "click .tag-input-group-remove": function (event, template) {
    return Meteor.call("shop/removeHeaderTag", this._id, currentTag(),
      function (error) {
        if (error) {
          return Alerts.add(
            "Tag is in use. It must be deleted from products first.",
            "warning", {
              autoHide: true
            });
        }
        return template.$(".tags-submit-new").focus();
      });
  },
  "click .tag-input-group-hide": function (event, template) {
    return Meteor.call("shop/hideHeaderTag", this._id,
      function (error) {
        if (error) {
          return Alerts.add(
            "An error occurred, the tag couldn't be hidden.",
            "warning", {
              autoHide: true
            });
        }
        return template.$(".tags-submit-new").focus();
      });
  },
  "focusin .tags-input-select": function (tagEvent) {
    return $(tagEvent.currentTarget).autocomplete({
      delay: 0,
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
      },
      select: function (event, ui) {
        if (ui.item.value) {
          return Meteor.call("shop/updateHeaderTags", ui.item.value,
            this._id, currentTag(),
            function (error) {
              if (error) {
                return Alerts.add(
                  "Tag already exists, duplicate add failed.",
                  "danger", {
                    autoHide: true
                  });
              }
            });
        }
      }
    });
  },
  "focusout .tags-input-select": function (event, template) {
    let val;
    val = $(event.currentTarget).val();
    if (val) {
      return Meteor.call("shop/updateHeaderTags", val, this._id,
        currentTag(),
        function (error) {
          if (error) {
            Alerts.add("Tag already exists, duplicate add failed.",
              "danger", {
                autoHide: true
              });
          }
          return template.$(".tags-submit-new").val("").focus();
        });
    }
  },
  "mousedown .tag-input-group-handle": function (event, template) {
    isMovingTag = true;
    Tracker.flush();
    return template.$(".tag-edit-list").sortable("refresh");
  }
});

/**
 * tagInputForm onRendered
 */

Template.tagInputForm.onRendered(function () {
  return $(".tag-edit-list").sortable({
    items: "> li",
    axis: "x",
    handle: ".tag-input-group-handle",
    update: function () {
      let uiPositions = $(this).sortable("toArray", {
        attribute: "data-tag-id"
      });
      let _results = [];
      for (let tag of uiPositions) {
        _results.push(Tags.update(tag, {
          $set: {
            position: _.indexOf(uiPositions, tag)
          }
        }));
      }
      return _results;
    },
    stop: function () {
      isMovingTag = false;
      return isMovingTag;
    }
  });
});
