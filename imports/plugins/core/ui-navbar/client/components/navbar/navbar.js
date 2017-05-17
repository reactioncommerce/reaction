import { FlatButton } from "/imports/plugins/core/ui/client/components";
import { NotificationContainer } from "/imports/plugins/included/notifications/client/containers";
import { Reaction } from "/client/api";
import { Tags } from "/lib/collections";
import CartPanel from "../../../../checkout/client/templates/cartPanel/container/cartPanelContainer";
import { getTagIds } from "/lib/selectors/tags";
import TagNavContainer from "/imports/plugins/core/ui-tagnav/client/containers/tagNavContainer";
import TagNav from "/imports/plugins/core/ui-tagnav/client/components/tagNav";

Template.CoreNavigationBar.onCreated(function () {
  this.state = new ReactiveDict();
  const searchPackage = Reaction.Apps({ provides: "ui-search" });
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
    }, $("html").get(0));
    $("body").css("overflow", "hidden");
    $("#search-input").focus();
  },
  "click .notification-icon": function () {
    $("body").css("overflow", "hidden");
    $("#notify-dropdown").focus();
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
  notificationButtonComponent() {
    return {
      component: NotificationContainer
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

  tagNav() {
    const instance = Template.instance();
    const tags = Tags.find({ isTopLevel: true }, { sort: { position: 1 } }).fetch();
    const tagsByKey = {};

    if (Array.isArray(tags)) {
      for (const tag of tags) {
        tagsByKey[tag._id] = tag;
      }
    }

    const props = {
      name: "coreHeaderNavigation",
      hasEditRights: Reaction.hasAdminAccess(),
      isEditing: true,
      tagsAsArray: tags,
      tagIds: getTagIds({ tags }),
      tagsByKey,
      onToggleMenu(callback) {
        // Register the callback
        instance.toggleMenuCallback = callback;
      }
    };

    return {
      component: TagNavContainer(TagNav),
      ...props
    };
  },

  cartPanel() {
    return CartPanel;
  }
});
