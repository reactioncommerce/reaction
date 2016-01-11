/**
 * layoutHeader events
 */
Template.layoutHeader.events({
  "click .navbar-accounts .dropdown-toggle": function () {
    return setTimeout(function () {
      return $("#login-email").focus();
    }, 100);
  },
  "click .header-tag, click .navbar-brand": function () {
    return $(".dashboard-navbar-packages ul li").removeClass("active");
  }
});

Template.layoutHeader.helpers({
  TagNav() {
    return ReactionUI.TagNav.Components.TagNav;
  },

  isEditable() {
    return ReactionCore.hasAdminAccess();
  },


  tags: function () {
    let tags = [];

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
