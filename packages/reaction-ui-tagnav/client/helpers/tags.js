/**
 * Reaction TagNav shared helpers
 * @type {Object}
 */
ReactionUI.TagNav.Helpers = {
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
  },

  currentTag() {
    return Session.get("currentTag");
  },

  getTags() {
    let tags = [];

    tags = ReactionCore.Collections.Tags.find({
      isTopLevel: true
    }, {
      sort: {
        position: 1
      }
    }).fetch();
    /*
    if (this.tagIds) {
      for (let relatedTagId of this.tagIds) {
        if (!_.findWhere(tags, {
          _id: relatedTagId
        })) {
          tags.push(Tags.findOne(relatedTagId));
        }
      }
    }*/

    if (this.tag) {
      Session.set("currentTag", this.tag._id);
    } else {
      Session.set("currentTag", "");
    }

    return tags;
    // there are cases where
    // we'll have no tags, and sort will error
    // so we check length for safety
    // if (tags) {
    //   tags.sort(function (a, b) {
    //     return a.position - b.position;
    //   });
    //   return tags;
    // }
  },

  createTag(tagName, tagId, parentTag) {
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
  },

  updateTag(tagId, tagName, parentTagId) {
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
  },

  moveTagToNewParent(movedTagId, toListId, toIndex) {
    console.log(`Would Add item ${movedTagId} to list ${toListId}, with index ${toIndex}`);
    ReactionCore.Collections.Tags.update(toListId,
      {
        $addToSet: {
          relatedTagIds: movedTagId
        }
      }
    );

  },

  sortTags(tagIds, parentTag) {
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
  },

  removeTag(tag, parentTag) {
      // console.log(`Would Remove item ${movedTagId} from list ${fromListId}`);
      console.log("Trying to remove top level tag", tag);

    if (_.isEmpty(parentTag) === false) {
      ReactionCore.Collections.Tags.update(parentTag._id,
        {
          $pullAll: {
            relatedTagIds: [tag._id]
          }
        }
      );
    } else if (tag.isTopLevel === true) {
      console.log("Trying to remove top level tag");
      ReactionCore.Collections.Tags.update(tag._id,
        {
          $set: {
            isTopLevel: false
          }
        }
      );
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
  },

};
