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

  tags() {
    let tags = [];

    tags = ReactionCore.Collections.Tags.find({
      isTopLevel: true
    }, {
      sort: {
        position: 1
      }
    }).fetch();

    return tags;
  }
});
