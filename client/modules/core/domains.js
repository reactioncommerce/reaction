import url from "url";
import { Meteor } from "meteor/meteor";

export const DomainsMixin = {
  shopDomain() {
    return document.location.hostname;
  },

  /**
   * absoluteUrl
   * @summary a wrapper method for Meteor.absoluteUrl which sets the rootUrl to
   * the current URL (instead of defaulting to ROOT_URL)
   * @param {String} [pathOrOptions] A path to append to the root URL. Do not include a leading "`/`".
   *                                 absoluteUrl can be called with a single
   *                                 parameter, where pathOrOptions can be the
   *                                 path (String) or the options (Object)
   * @param {Object} [options]
   * @param {Boolean} options.secure Create an HTTPS URL.
   * @param {Boolean} options.replaceLocalhost Replace localhost with 127.0.0.1. Useful for services that don't recognize localhost as a domain name.
   * @param {String} options.rootUrl Override the default ROOT_URL from the server environment. For example: "`http://foo.example.com`"
   * @return {String} URL for the given path and options
   */
  absoluteUrl(pathOrOptions, options) {
    let path;
    let opts;
    // path is optional
    if (!options && typeof pathOrOptions === "object") {
      path = undefined;
      opts = Object.assign({}, pathOrOptions);
    } else {
      path = pathOrOptions;
      opts = Object.assign({}, options);
    }

    const hasRootUrl = "rootUrl" in opts;

    // presumably, you could simply access window.location.href here, but when
    // we get to server-side rendering, it is better to use a variable that gets
    // assigned when we are sure we are rendering in the browser
    const domain = this.shopDomain();

    if (!hasRootUrl && domain) {
      // unfortunately, the scheme/protocal is not available here, so let's
      // get it from the default Meteor absoluteUrl options, then replace the
      // host
      const rootUrl = url.parse(Meteor.absoluteUrl.defaultOptions.rootUrl);
      rootUrl.host = domain;
      opts.rootUrl = rootUrl.format();
    }

    return Meteor.absoluteUrl(path, opts);
  },

  /**
   * getDomain
   * @summary extracts the domain name from the absoluteUrl.
   * @param {Object} [options] inheritied from absoluteUrl
   * @param {Boolean} options.replaceLocalhost Replace localhost with 127.0.0.1. Useful for services that don't recognize localhost as a domain name.
   * @param {String} options.rootUrl Override the default ROOT_URL from the server environment. For example: "`http://foo.example.com`"
   * @return {String} Domain/hostname for the given options
   */
  getDomain(options) {
    return this.absoluteUrl("", options).split("/")[2].split(":")[0];
  }
};
