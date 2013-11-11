// *****************************************************
// general helper for plurization of strings
// returns string with 's' concatenated if n = 1
// *****************************************************
Handlebars.registerHelper('pluralize', function (n, thing) {
  // fairly stupid pluralizer
  if (n === 1) {
    return '1 ' + thing;
  } else {
    return n + ' ' + thing + 's';
  }
});
// *****************************************************
// general helper user name handling
// todo: needs additional validation all use cases
// returns first word in profile name
// *****************************************************
Handlebars.registerHelper('fname', function () {
  if (Meteor.user()) {
    var name = Meteor.user().profile.name.split(' ');
    var fname = name[0];
    return fname;
  }
});
// *****************************************************
// general helper for determine if user has a store
// returns boolean
// *****************************************************
Handlebars.registerHelper('userHasProfile', function () {
  var user = Meteor.user();
  return user && !!user.profile.store;
});

Handlebars.registerHelper('userHasRole', function (role) {
  var user = Meteor.user();
  return user && user.roles.indexOf(role) !== -1;
});

// *****************************************************
// general helper to return 'active' when on current path
// returns string
// handlebars: {{active '/some/page'}}
// *****************************************************
curPath = function () {
  var c = window.location.pathname;
  var b = c.slice(0, -1);
  var a = c.slice(-1);
  if (b == "") {return"/"} else {if (a == "/") {return b} else {return c}}
};
// Determine if current link should be active
Handlebars.registerHelper('active', function (path) {
  return curPath() == path ? 'active' : '';
});
// *****************************************************
// general helper to return 'active' when on current path
// returns string
// handlebars: {{navLink 'projectsList' 'icon-edit'}}
// *****************************************************

Handlebars.registerHelper('navLink', function (page, icon) {
  var ret = "<li ";
  if (Meteor.Router.page() == page) {
    ret += "class='active'";
  }
  ret += "><a href='" + Meteor.Router.namedRoutes[page].path + "'><i class='" + icon + " icon-fixed-width'></i></a></li>";
  return new Handlebars.SafeString(ret);
});
