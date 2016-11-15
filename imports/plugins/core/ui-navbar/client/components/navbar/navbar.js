import { FlatButton } from "/imports/plugins/core/ui/client/components";
import { Reaction } from "/client/api";
import { Tags } from "/lib/collections";


Template.CoreNavigationBar.onCreated(function () {
  this.state = new ReactiveDict();
  const searchPackage = Reaction.Apps({provides: "ui-search"});
  if (searchPackage.length) {
    this.state.set("searchEnabled", true);
    this.state.set("searchTemplate", searchPackage[0].template);
  } else {
    this.state.set("searchEnabled", false);
  }
});

/**
 * layoutHeader events
 */
Template.CoreNavigationBar.events({
  "click .navbar-accounts .dropdown-toggle": function () {
    return setTimeout(function () {
      return $("#login-email").focus();
    }, 100);
  },
  "click .header-tag, click .navbar-brand": function () {
    return $(".dashboard-navbar-packages ul li").removeClass("active");
  },
  "click .search": function () {
    const instance = Template.instance();
    const searchTemplateName = instance.state.get("searchTemplate");
    const searchTemplate = Template[searchTemplateName];
    Blaze.renderWithData(searchTemplate, {
    }, $("body").get(0));
    $("body").css("overflow", "hidden");
    $("#search-input").focus();
  }
});

Template.CoreNavigationBar.helpers({
  isSearchEnabled() {
    const instance = Template.instance();
    return instance.state.get("searchEnabled");
  },

  searchTemplate() {
    const instance = Template.instance();
    if (instance.state.get("searchEnabled")) {
      return instance.state.get("searchTemplate");
    }
  },

  IconButtonComponent() {
    return {
      component: FlatButton,
      icon: "fa fa-search",
      kind: "flat"
    };
  },
  onMenuButtonClick() {
    const instance = Template.instance();
    return () => {
      if (instance.toggleMenuCallback) {
        instance.toggleMenuCallback();
      }
    };
  },

  tagNavProps() {
    const instance = Template.instance();
    const tags = Tags.find({
      isTopLevel: true
    }, {
      sort: {
        position: 1
      }
    }).fetch();

    return {
      name: "coreHeaderNavigation",
      editable: Reaction.hasAdminAccess(),
      isEditing: true,
      tags: tags,
      onToggleMenu(callback) {
        // Register the callback
        instance.toggleMenuCallback = callback;
      }
    };
  }
});
