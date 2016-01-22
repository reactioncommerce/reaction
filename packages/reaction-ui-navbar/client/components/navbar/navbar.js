
Template.CoreNavigationBar.onCreated(function () {
  this.state = new ReactiveDict();
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
  }
});

Template.CoreNavigationBar.helpers({
  onMenuButtonClick() {
    const instance = Template.instance();
    return (event) => {
      if (instance.data.onMenuButtonClick) {
        instance.data.onMenuButtonClick(event);
      }
    };
  },
});
