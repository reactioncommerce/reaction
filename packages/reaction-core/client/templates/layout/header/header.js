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
  },
  "keydown .navbar-search input": function () {
    setTimeout(function(){
      Session.set(SessionKey.Search,  $(".navbar-search input").val())
    },0)
  }


});
