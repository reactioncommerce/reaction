//
// Layout container uses body
//
BlazeLayout.setRoot("body");

/**
 * pathFor
 * @summary get current router path
 * @param {String} path - path to fetch
 * @param {Object} options - url params
 * @return {String} returns current router path
 */
ReactionRouter.pathFor = pathFor = (path, options = {}) => {
  let params = options.hash || {};
  let query = params.query ? ReactionRouter._qs.parse(params.query) : {};
  // prevent undefined param error
  for (let i in params) {
    if (params[i] === null || params[i] === undefined) {
      params[i] = "/";
    }
  }
  return ReactionRouter.path(path, params, query);
};

//
// pathFor
// template helper to return path
//
Template.registerHelper("pathFor", pathFor);

//
// urlFor
// template helper to return absolute + path
//
Template.registerHelper("urlFor", (path, params) => {
  return Meteor.absoluteUrl(pathFor(path, params).substr(1));
});

/**
 * isActive
 * @summary general helper to return "active" when on current path
 * @example {{active "name"}}
 * @param {String} routeName - route name as defined in registry
 * @return {String} return "active" or null
 */
ReactionRouter.isActiveClassName = (routeName) => {
  ReactionRouter.watchPathChange();
  const group = ReactionRouter.current().route.group;
  let prefix;
  if (group && group.prefix) {
    prefix = ReactionRouter.current().route.group.prefix;
  } else {
    prefix = "";
  }
  const path = ReactionRouter.current().route.path;
  const routeDef = path.replace(prefix + "/", "");
  return routeDef === routeName ? "active" : "";
};

Template.registerHelper("active", ReactionRouter.isActiveClassName);
