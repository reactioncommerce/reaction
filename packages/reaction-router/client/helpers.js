//
// Layout container uses body
//
BlazeLayout.setRoot("body");

/**
 * pathFor
 * @summary get current router path
 * @param {String} path - path to featch
 * @param {Object} params - url params
 * @return {String} returns current router path
 */
pathFor = (reqPath, reqParams) => {
  let path = reqPath;
  let params = reqParams;
  // accept "path/value" case
  if (!path.hash && params && !params.hash) {
    const shortcut = path + "/" + params;
    return Router.path(shortcut);
  }
  // accept path/param/value
  if (path.hash) {
    params = path;
    path = params.hash.route;
    delete params.hash.route;
  }
  let query = params.hash.query ? Router._qs.parse(params.hash.query) : {};
  return Router.path(path, params.hash, query);
};
// return path
Template.registerHelper("pathFor", pathFor);
// deprecated same as pathFor
Template.registerHelper("pathForSEO", pathFor);
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
  Router.watchPathChange();
  return Router.current().route.name === route ? "active" : "";
});
// common in meteor apps.
Template.registerHelper("currentRoute", (route) => {
  Router.watchPathChange();
  return Router.current().route.name === route ? "active" : "";
});
