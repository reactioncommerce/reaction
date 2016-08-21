import { Tags } from "/lib/collections";
import { Meteor } from "meteor/meteor";
import { Session } from "meteor/session";
import { Template } from "meteor/templating";

/**
 * Reaction TagNav shared helpers
 * @type {Object}
 */
export const TagHelpers = {
  moveItem(oldArray, fromIndex, toIndex) {
    const newArray = [...oldArray];
    newArray.splice(toIndex, 0, newArray.splice(fromIndex, 1)[0]);
    return newArray;
  },

  subTags(parentTag) {
    if (_.isArray(parentTag.relatedTagIds)) {
      const tags = Tags.find({
        isTopLevel: false,
        _id: {
          $in: parentTag.relatedTagIds
        }
      }).fetch();

      const subTags = parentTag.relatedTagIds.map((tagId) => {
        return _.find(tags, (tagObject) => {
          return tagObject._id === tagId;
        });
      });

      return subTags;
    }

    return false;
  },

  currentTag() {
    return Session.get("currentTag");
  },

  getTags() {
    let tags = [];

    tags = Tags.find({
      isTopLevel: true
    }, {
      sort: {
        position: 1
      }
    }).fetch();
    /*
    if (this.tagIds) {
      for (let relatedTagId of this.tagIds) {
        if (!_.find(tags, {
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
          Alerts.toast("Tag already exists, duplicate add failed.", "error");
        }
      });
  },

  updateTag(tagId, tagName, parentTagId) {
    Meteor.call("shop/updateHeaderTags", tagName, tagId, parentTagId,
      function (error) {
        if (error) {
          Alerts.toast("Tag already exists, duplicate add failed.", "error");
        }
      });
  },

  /* eslint no-unused-vars: 0 */
  //
  //   TODO review toIndex, ofList variable implementation in tags.js moveTagToNewParent
  //
  moveTagToNewParent(movedTagId, toListId, toIndex, ofList) {
    if (movedTagId) {
      if (toListId) {
        const result = Tags.update(toListId,
          {
            $addToSet: {
              relatedTagIds: movedTagId
            }
          }
        );

        return result;
      }

      const result = Tags.update(movedTagId,
        {
          $set: {
            isTopLevel: true
          }
        }
      );

      return result;
    }
    return 0;
  },

  sortTags(tagIds, parentTag) {
    if (_.isArray(tagIds)) {
      if (_.isEmpty(parentTag)) {
        // Top level tags
        for (const tagId of tagIds) {
          Tags.update(tagId, {
            $set: {
              position: tagIds.indexOf(tagId)
            }
          });
        }
      } else {
        // Sub tags
        Tags.update(parentTag._id, {
          $set: {
            relatedTagIds: _.compact(tagIds)
          }
        });
      }
    }
  },

  removeTag(tag, parentTag) {
    if (_.isEmpty(parentTag) === false) {
      Tags.update(parentTag._id,
        {
          $pullAll: {
            relatedTagIds: [tag._id]
          }
        }
      );
    } else if (tag.isTopLevel === true) {
      Tags.update(tag._id,
        {
          $set: {
            isTopLevel: false
          }
        }
      );
    }
  }
};

Template.registerHelper("reactionSubTags", TagHelpers.subTags);
