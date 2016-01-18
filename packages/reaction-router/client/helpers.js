//
// Layout container uses body
//
BlazeLayout.setRoot("body");

/**
 * pathForSEO
 * @summary get current router path
 * @param {String} path - path to featch
 * @param {Object} params - url params
 * @return {String} returns current router path
 */
Template.registerHelper("pathForSEO", function (path, params) {
  if (this[params]) {
    return  "/" + path + "/" + this[params];
  }
  return  "/" + FlowRouter.pathDef(path, this);
});


Template.registerHelper("pathFor", function (path, params) {
  if (this[params]) {
    return  "/" + path + "/" + this[params];
  }
  return  "/" + FlowRouter.path(path);
});


/**
 * activeRouteClass
 * @summary registerHelper activeRouteClass
 * @return {String} return "active" if this current path
 */
Template.registerHelper("activeRouteClass", function () {
  let args = Array.prototype.slice.call(arguments, 0);
  args.pop();
  let active = _.any(args, function (name) {
    return location.pathname === FlowRouter.path(name);
  });
  return active && "active";
});

/**
 * active
 * @summary general helper to return "active" when on current path
 * @example {{active "route"}}
 * @param {String} path - iron router path
 * @return {String} return 'active' or null
 */
Template.registerHelper("active", function (path) {
  let current;
  let routeName;
  current = Router.current();
  routeName = current && current.route.getName();
  if (routeName === path) {
    return "active";
  }
  return "";
});

/**
 * navLink
 * @summary general helper to return "active" when on current path
 * @example {{navLink "projectsList" "icon-edit"}}
 * @param {String} page - iron-router path
 * @param {String} icon - icon class
 * @return {String} returns formatted, SafeString anchor html
 */
Template.registerHelper("navLink", function (page, icon) {
  let ret;
  ret = "<li ";
  if (Meteor.Router.page() === page) {
    ret += `class="active"`;
  }
  ret +=
    `><a href="${Meteor.Router.namedRoutes[page].path}"><i class="${icon}" icon-fixed-width"></i></a></li>`;
  return new Spacebars.SafeString(ret);
});
