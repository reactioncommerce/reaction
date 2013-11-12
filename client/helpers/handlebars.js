Handlebars.registerHelper("condition", function (v1, operator, v2, options) {
  switch (operator) {
    case "==":
    case "eq":
      return v1 == v2;
    case "!=":
    case "neq":
      return v1 != v2;
    case "===":
    case "ideq":
      return v1 === v2;
    case "!==":
    case "nideq":
      return v1 !== v2;
    case "&&":
    case "and":
      return v1 && v2;
    case "||":
    case "or":
      return v1 || v2;
    case "<":
    case "lt":
      return v1 < v2;
    case "<=":
    case "lte":
      return v1 <= v2;
    case ">":
    case "gt":
      return v1 > v2;
    case ">=":
    case "gte":
      return v1 >= v2;
    default:
      throw 'Undefined operator "'+operator+'"';
  }
});

/**
 * Convert new line (\n\r) to <br>
 * from http://phpjs.org/functions/nl2br:480
 */
Handlebars.registerHelper('nl2br', function (text) {
//        text = Handlebars.Utils.escapeExpression(text);
  var nl2br = (text + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + '<br>' + '$2');
  return new Handlebars.SafeString(nl2br);
});

/**
 *  format an ISO date using Moment.js
 *  http://momentjs.com/
 *  moment syntax example: moment(Date("2011-07-18T15:50:52")).format("MMMM YYYY")
 *  usage: {{dateFormat creation_date format="MMMM YYYY"}}
 */
Handlebars.registerHelper('dateFormat', function (context, block) {
  if (window.moment) {
    var f = block.hash.format || i18n.t('dateFormat');
    var lang = Meteor.user().profile.settings.locale || i18n.lng();
    var indexOf = lang.indexOf('_');
    moment.lang(indexOf == -1 ? lang : lang.substr(0, indexOf));
    return moment(new Date(context)).format(f);
  } else {
    return context;   //  moment plugin not available. return data as is.
  }
});

Handlebars.registerHelper('uc', function (str) {
  return encodeURIComponent(str);
});
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
  if (b == "") {
    return"/"
  } else {
    if (a == "/") {
      return b
    } else {
      return c
    }
  }
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

// *****************************************************
// Function that randomly picks colors for package tiles
// returns random color
// *****************************************************

Handlebars.registerHelper('tileColors', function() {
  var colors = ['blue', 'light-blue', 'dark-blue', 'red', 'orange', 'magenta', 'lime', 'yellow', 'pink', 'aqua', 'fuchsia', 'gray', 'maroon', 'olive', 'purple', 'teal', 'green'];
  return colors[Math.floor(Math.random() * colors.length)];
});

// *****************************************************
// Function allows you to load templates dynamically
// format: {{{getTemplate package context}}}
// example: {{{getTemplate widget }}}
// *****************************************************
Handlebars.registerHelper('getTemplate', function(pkg, context) {
   templateName = pkg + "-widget";
   if (Template[templateName]) return Template[templateName](context);
});
