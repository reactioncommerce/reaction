import { Template } from "meteor/templating";
import { $ } from "meteor/jquery";

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
  coreNavProps() {
    const instance = Template.instance();
    return {
      onMenuButtonClick() {
        instance.toggleMenuCallback();
      }
    };
  }
});
