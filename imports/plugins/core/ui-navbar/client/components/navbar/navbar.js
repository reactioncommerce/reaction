import { NotificationContainer } from "/imports/plugins/included/notifications/client/containers";
import { Reaction } from "/client/api";
import { Tags } from "/lib/collections";
import CartPanel from "../../../../checkout/client/templates/cartPanel/container/cartPanelContainer";
import BrandContainer from "./containers/brandContainer";
import CartIconContainer from "/imports/plugins/core/checkout/client/container/cartIconContainer.js";
import MainDropdown from "/client/modules/accounts/containers/dropdown/mainDropdownContainer.js";
import NavBarContainer from "./containers/navbarContainer";

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
  cartIcon() {
    return {
      component: CartIconContainer
    };
  },
  dropdown() {
    return {
      component: MainDropdown
    };
  },
  navbar() {
    return {
      component: NavBarContainer
    };
  },
  brandComponent() {
    return {
      component: BrandContainer
    };
  },

  searchTemplate() {
    const instance = Template.instance();
    if (instance.state.get("searchEnabled")) {
      return instance.state.get("searchTemplate");
    }
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
  },
  cartPanel() {
    return CartPanel;
  }
});
