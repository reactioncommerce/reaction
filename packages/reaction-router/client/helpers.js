//
// Layout container uses body
//
BlazeLayout.setRoot("body");

/**
 * pathFor
 * @summary get current router path
 * @param {String} reqPath - path to fetch
 * @param {Object} reqParams - url params
 * @return {String} returns current router path
 */
ReactionRouter.pathFor = pathFor = (path, options = {}) => {
  // let {params, query} = options;
  let params = options.hash;
  // let query = params.hash.query ? ReactionRouter._qs.parse(params.hash.query) : {};
  let route = ReactionRouter.path(path, params);
  // not sure why FlowRoute.path isn't prefixing
  if (route.substring(0, 1) !== "/") {
    route = "/" + route;
  }
  // console.log(`Requested path for ${path} and returned route: ${route}`);
  return route;
};
// return path
Template.registerHelper("pathFor", pathFor);
// deprecated same as pathForSEO
// Template.registerHelper("pathForSEO", pathFor);

// absolute + path
Template.registerHelper("urlFor", (path, params) => {
  return Meteor.absoluteUrl(pathFor(path, params).substr(1));
});

/**
 * active
 * @summary general helper to return "active" when on current path
 * @example {{active "route"}}
 * @param {String} path - iron router path
 * @return {String} return "active" or null
 */
Template.registerHelper("active", (route) => {
  ReactionRouter.watchPathChange();
  return ReactionRouter.current().path === "/" + route ? "active" : "";
});
// common in meteor apps.
Template.registerHelper("currentRoute", (route) => {
  ReactionRouter.watchPathChange();
  return ReactionRouter.current().path === "/" + route ? "active" : "";
});
