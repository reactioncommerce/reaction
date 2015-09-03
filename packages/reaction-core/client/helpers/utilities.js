
/**
*
* Reaction Spacebars helpers
* See: http://docs.meteor.com/#/full/template_registerhelper
*
*/

if (Package.blaze) {
  Package.blaze.Blaze.Template.registerHelper('currentUser', function() {
    var isAnonymous, isGuest;
    if (Session.get("currentShopId")) {
      isGuest = Roles.userIsInRole(Meteor.user(), 'guest', ReactionCore.getShopId());
      isAnonymous = Roles.userIsInRole(Meteor.user(), 'anonymous', ReactionCore.getShopId());
      if (!isGuest && isAnonymous) {
        return null;
      } else if (isGuest && !isAnonymous) {
        return Meteor.user();
      } else {
        return null;
      }
    }
  });
}

/**
* registerHelper monthOptions
*/

Template.registerHelper("monthOptions", function() {
  var index, label, month, monthOptions, months, _i, _len;
  label = i18n.t('app.monthOptions') || "Choose month";
  monthOptions = [
    {
      value: "",
      label: label
    }
  ];
  months = moment.months();
  for (index = _i = 0, _len = months.length; _i < _len; index = ++_i) {
    month = months[index];
    monthOptions.push({
      value: index + 1,
      label: month
    });
  }
  return monthOptions;
});

/**
* registerHelper yearOptions
*/

Template.registerHelper("yearOptions", function() {
  var label, x, year, yearOptions, _i;
  label = i18n.t('app.yearOptions') || "Choose year";
  yearOptions = [
    {
      value: "",
      label: label
    }
  ];
  year = new Date().getFullYear();
  for (x = _i = 1; _i < 9; x = _i += 1) {
    yearOptions.push({
      value: year,
      label: year
    });
    year++;
  }
  return yearOptions;
});

/**
* registerHelper timezoneOptions
*/

Template.registerHelper("timezoneOptions", function() {
  var index, label, timezone, timezoneOptions, timezones, _i, _len;
  label = i18n.t('app.timezoneOptions') || "Choose timezone";
  timezoneOptions = [
    {
      value: "",
      label: label
    }
  ];
  timezones = moment.tz.names();
  for (index = _i = 0, _len = timezones.length; _i < _len; index = ++_i) {
    timezone = timezones[index];
    timezoneOptions.push({
      value: timezone,
      label: timezone
    });
  }
  return timezoneOptions;
});

/**
* registerHelper pathForSEO
*/
Template.registerHelper("pathForSEO", function(path, params) {
  if (this[params]) {
    return "/" + path + "/" + this[params];
  } else {
    return Router.path(path, this);
  }
});

/**
* registerHelper displayName
*/
Template.registerHelper("displayName", function(user) {
  var username;
  user = user || Meteor.user();
  if (user && user.profile && user.profile.name) {
    return user.profile.name;
  } else if (user && user.username) {
    return user.username;
  }
  if (user && user.services) {
    return username = (function() {
      switch (false) {
        case !user.services.twitter:
          return user.services.twitter.name;
        case !user.services.facebook:
          return user.services.facebook.name;
        case !user.services.instagram:
          return user.services.instagram.name;
        case !user.services.pinterest:
          return user.services.pinterest.name;
        default:
          return i18n.t('accountsUI.guest') || "Guest";
      }
    })();
  } else {
    return i18n.t('accountsUI.signIn') || "Sign in";
  }
});

/**
* registerHelper fName
*/

Template.registerHelper("fName", function(user) {
  var username;
  user = user || Meteor.user();
  if (user && user.profile && user.profile.name) {
    return user.profile.name.split(" ")[0];
  } else if (user && user.username) {
    return user.username.name.split(" ")[0];
  }
  if (user && user.services) {
    return username = (function() {
      switch (false) {
        case !user.services.twitter:
          return user.services.twitter.first_name;
        case !user.services.facebook:
          return user.services.facebook.first_name;
        case !user.services.instagram:
          return user.services.instagram.first_name;
        case !user.services.pinterest:
          return user.services.pinterest.first_name;
        default:
          return i18n.t('accountsUI.guest') || "Guest";
      }
    })();
  } else {
    return i18n.t('accountsUI.signIn') || "Sign in";
  }
});

/**
* registerHelper camelToSpace
*/

Template.registerHelper("camelToSpace", function(str) {
  var downCamel;
  downCamel = str.replace(/\W+/g, "-").replace(/([a-z\d])([A-Z])/g, "$1 $2");
  return downCamel.toLowerCase();
});

/**
* registerHelper toLowerCase
*/

Template.registerHelper("toLowerCase", function(str) {
  return str.toLowerCase();
});

/**
* registerHelper toUpperCase
*/

Template.registerHelper("toUpperCase", function(str) {
  return str.toUpperCase();
});

/**
* registerHelper capitalize
*/

Template.registerHelper("capitalize", function(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
});

/**
* registerHelper toCamelCase
*/

Template.registerHelper("toCamelCase", function(str) {
  if (!!str) return str.toCamelCase();
});


/**
 * registerHelper activeRouteClass
 * @return "active" if current path
 */

Template.registerHelper("activeRouteClass", function() {
  var active, args;
  args = Array.prototype.slice.call(arguments, 0);
  args.pop();
  active = _.any(args, function(name) {
    return location.pathname === Router.path(name);
  });
  return active && "active";
});


/**
 * siteName()
 * return site name
 */

Template.registerHelper("siteName", function() {
  var _ref;
  return (_ref = Shops.findOne()) != null ? _ref.name : void 0;
});


/**
 *  General helpers for template functionality
 */


/**
* registerHelper condition
* conditional template helpers
* example:  {{#if condition status "eq" ../value}}
*/

Template.registerHelper("condition", function(v1, operator, v2, options) {
  switch (operator) {
    case "==":
    case "eq":
      return v1 === v2;
    case "!=":
    case "neq":
      return v1 !== v2;
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
      throw "Undefined operator \"" + operator + "\"";
  }
});

/**
* registerHelper orElse
*/

Template.registerHelper("orElse", function(v1, v2) {
  return v1 || v2;
});

/**
* registerHelper key_value
*/
Template.registerHelper("key_value", function(context, options) {
  var result;
  result = [];
  _.each(context, function(value, key, list) {
    return result.push({
      key: key,
      value: value
    });
  });
  return result;
});


/**
 * registerHelper nl2br
 * Convert new line (\n\r) to <br>
 * from http://phpjs.org/functions/nl2br:480
 */

Template.registerHelper("nl2br", function(text) {
  var nl2br;
  nl2br = (text + "").replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, "$1" + "<br>" + "$2");
  return new Spacebars.SafeString(nl2br);
});


/**
 * registerHelper dateFormat
 *
 * format an ISO date using Moment.js
 * http://momentjs.com/
 * moment syntax example: moment(Date("2011-07-18T15:50:52")).format("MMMM YYYY")
 * usage: {{dateFormat creation_date format="MMMM YYYY"}}
 */

Template.registerHelper("dateFormat", function(context, block) {
  var f;
  if (window.moment) {
    f = block.hash.format || "MMM DD, YYYY hh:mm:ss A";
    return moment(context).format(f);
  } else {
    return context;
  }
});


/**
 * registerHelper pluralize
 *
 * general helper for plurization of strings
 * returns string with 's' concatenated if n = 1
 * TODO: adapt to, and use i18n
 */

Template.registerHelper("pluralize", function(n, thing) {
  if (n === 1) {
    return "1 " + thing;
  } else {
    return n + " " + thing + "s";
  }
});


/**
 * registerHelper active
 *
 * general helper to return 'active' when on current path
 * returns string\
 * handlebars: {{active 'route'}}
 */

Template.registerHelper("active", function(path) {
  var current, routeName;
  current = Router.current();
  routeName = current && current.route.getName();
  if (routeName === path) {
    return "active";
  } else {
    return "";
  }
});


/**
 * registerHelper navLink
 *
 * general helper to return 'active' when on current path
 * returns string
 * handlebars: {{navLink 'projectsList' 'icon-edit'}}
 */

Template.registerHelper("navLink", function(page, icon) {
  var ret;
  ret = "<li ";
  if (Meteor.Router.page() === page) {
    ret += "class='active'";
  }
  ret += "><a href='" + Meteor.Router.namedRoutes[page].path + "'><i class='" + icon + " icon-fixed-width'></i></a></li>";
  return new Spacebars.SafeString(ret);
});
