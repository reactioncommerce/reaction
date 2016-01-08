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


const {Tags} = ReactionCore.Collections;

const TagComponent = ReactionUI.Components.Tag;


// Template.headerLinks.onRendered(() => {
//   const template = Template.instance();
//
//   const tenter = new Tether({
//     element: template.firstN,
//     target: greenBox,
//     attachment: 'top right',
//     targetAttachment: 'top left'
//   });
// });








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

  subTags(parentTag) {
    const tags = Tags.find({
      isTopLevel: false,
      _id: {
        $in: parentTag.relatedTagIds
      }
    }, {
      sort: {
        position: 1
      }
    }).fetch();



    return tags;
  },

  tags: function () {
    let tags = [];

    // if (this.tag) {
    //   let tagDoc = Tags.findOne(this.tag._id);
    //
    //   if (!tagDoc) {
    //     Session.set("currentTag", "");
    //     return tags;
    //   }
    //
    //   Session.set("currentTag", this.tag._id);
    //   tags.push(tagDoc);
    //   let relatedTagIds = tagDoc.relatedTagIds;
    //
    //   if (relatedTagIds) {
    //     for (let relatedTagId of relatedTagIds) {
    //       tags.push(Tags.findOne(relatedTagId));
    //     }
    //   }
    // } else {
    //
    // }

    tags = ReactionCore.Collections.Tags.find({
      isTopLevel: true
    }, {
      sort: {
        position: 1
      }
    }).fetch();
    if (this.tagIds) {
      for (let relatedTagId of this.tagIds) {
        if (!_.findWhere(tags, {
          _id: relatedTagId
        })) {
          tags.push(Tags.findOne(relatedTagId));
        }
      }
    }

    if (this.tag) {
      Session.set("currentTag", this.tag._id);
    } else {
      Session.set("currentTag", "");
    }

    return tags;
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





Template.headerLinks.onCreated(() => {
  const template = Template.instance();
  template.isEditing = new ReactiveVar(false);
});



/**
 * headerLinks events
 */

Template.headerLinks.events({
  "click #header-edit-tag": function () {
    setEditing(currentTag(), true);
    return Tracker.flush();
  },
  "click [data-event-action=editTags]": (event, template) => {
    event.preventDefault();
    let isEditing = template.isEditing.get();
    template.isEditing.set(!isEditing);
  }
});


/**
 * headerLinks helpers
 */

Template.headerLinks.helpers({

  /**
   * ReactionUI Tag Component
   * @return {[type]} [description]
   */
  Tags() {
    return ReactionUI.Components.Tags;
  },

  Tag() {
    return ReactionUI.Components.Tag;
  },


  handleTagCreate() {
    return (tagName, parentTag) => {
      let parentTagId;

      if (parentTag) {
        parentTagId = parentTag._id;
      }

      Meteor.call("shop/updateHeaderTags", tagName, null, parentTagId,
        function (error) {
          if (error) {
            Alerts.add("Tag already exists, duplicate add failed.",
              "danger", {
                autoHide: true
              });
          }
        });
    };
  },


  handleTagUpdate() {
    const template = Template.instance();


    return (tagName, tagId, parentTagId) => {
      console.log("-- final", tagName, tagId, parentTagId);


      Meteor.call("shop/updateHeaderTags", tagName, tagId, parentTagId,
        function (error) {
          if (error) {
            Alerts.add("Tag already exists, duplicate add failed.",
              "danger", {
                autoHide: true
              });
          }
          // return template.$(".tags-submit-new").val("").focus();
        });

    };
  },

  handleTagDragAdd() {
    const template = Template.instance();

    return (movedTagId, toListId, toIndex) => {
      console.log(`Would Add item ${movedTagId} to list ${toListId}, with index ${toIndex}`);
      // return
      ReactionCore.Collections.Tags.update(toListId,
        {
          $addToSet: {
            relatedTagIds: movedTagId
          }
        }
      );
    };

      // Tags.update(tag, {
      //   $set: {
      //     position: _.indexOf(uiPositions, tag)
      //   }
      // }
      //
      //
      // Meteor.call("shop/updateHeaderTags", tagName, tagId, parentTagId,
      //   function (error) {
      //     if (error) {
      //       Alerts.add("Tag already exists, duplicate add failed.",
      //         "danger", {
      //           autoHide: true
      //         });
      //     }
      //     // return template.$(".tags-submit-new").val("").focus();
      //   });

    // };
  },

  handleTagSort() {
    return (tagIds, parentTag) => {
      console.log(`Would Sort tags item`, tagIds);

      if (_.isArray(tagIds)) {
        ReactionCore.Collections.Tags.update(parentTag._id,
          {
            $set: {
              relatedTagIds: tagIds
            }
          }
        );
      }
    }
  },

  handleTagRemove() {
      return (tag, parentTag) => {
        // console.log(`Would Remove item ${movedTagId} from list ${fromListId}`);

        if (parentTag) {
          ReactionCore.Collections.Tags.update(parentTag._id,
            {
              $pullAll: {
                relatedTagIds: [tag._id]
              }
            }
          );
        } else if (tag.isTopLevel === true) {
          //??
        }

        return
        ReactionCore.Collections.Tags.update(fromListId,
          {
            $pull: {
              relatedTags: {
                $eq: tagIdToRemove
              }
            }
          }
        );
      };
  },


  isEditing() {
    return Template.instance().isEditing.get();
  },

  activeTag: function () {
    if (Session.equals("currentTag", this._id)) {
      return "active";
    }
  },

  subTags(parentTag) {
    if (_.isArray(parentTag.relatedTagIds)) {
      const tags = ReactionCore.Collections.Tags.find({
        isTopLevel: false,
        _id: {
          $in: parentTag.relatedTagIds
        }
      }, {
        sort: {
          position: 1
        }
      }).fetch();

      return tags;
    }

    return false;
  }
});


Template.relatedTags.onCreated(() => {
  const template = Template.instance();
  template.isEditing = new ReactiveVar(false);
});

Template.relatedTags.events({
  "click [data-event-action=editTags]": (event, template) => {
    event.preventDefault();
    template.isEditing.set(true);
  }
});


Template.relatedTags.helpers({
  subTags(parentTag) {
    if (_.isArray(parentTag.relatedTagIds)) {
      const tags = ReactionCore.Collections.Tags.find({
        isTopLevel: false,
        _id: {
          $in: parentTag.relatedTagIds
        }
      }, {
        sort: {
          position: 1
        }
      }).fetch();

      return tags;
    }

    return false;
  }
});

Template.relatedTagsForm.helpers({
  subTags(parentTag) {
    if (_.isArray(parentTag.relatedTagIds)) {
      const tags = ReactionCore.Collections.Tags.find({
        isTopLevel: false,
        _id: {
          $in: parentTag.relatedTagIds
        }
      }, {
        sort: {
          position: 1
        }
      }).fetch();

      return tags;
    }

    return false;
  }
});

Template.tagInputField.helpers({
  tag() {
    return Template.currentData().tag;
  },
  parentTag() {
    return Template.currentData().parentTag;
  }
});

Template.tagInputField.events({
  "submit form": (event) => {
    event.preventDefault();

    const currentData = Template.currentData();
    let parentTag = currentData.parentTag;
    let tag = currentData.tag || parentTag;
    let tagName = event.target.tag.value;

    if (tag) {
      Meteor.call("shop/updateHeaderTags", tagName, tag._id, parentTag._id,
        function (error) {
          if (error) {
            Alerts.add("Tag already exists, duplicate add failed.",
              "danger", {
                autoHide: true
              });
          }
          // return template.$(".tags-submit-new").val("").focus();
        });
    }
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
        _results.push(ReactionCore.Collections.Tags.update(tag, {
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
