// *****************************************************
// general helper for plurization of strings
// returns string with 's' concatenated if n = 1
// *****************************************************
Handlebars.registerHelper('pluralize', function(n, thing) {
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
Handlebars.registerHelper('fname', function(){
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
Handlebars.registerHelper('userhasprofile', function() {
  if (!Meteor.user().profile.store){
    return false
  }
  return true;
});