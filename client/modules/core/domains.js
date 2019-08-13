/* eslint-disable node/no-deprecated-api */
/* TODO: revisit `url.parse` throughout Reaction */
import url from "url";
import { composeUrl } from "/lib/core/url-common";

export const DomainsMixin = {
  shopDomain() {
    // We must use host rather than hostname in order to get the port, too, if present
    return document.location.host;
  },

  /**
   * absoluteUrl
   * @summary a wrapper method for composeUrl (formerly Meteor.absoluteUrl)
   * which sets the rootUrl to the current URL (instead of defaulting to
   * ROOT_URL)
   * @param {String} [pathOrOptions] A path to append to the root URL. Do not
   *                 include a leading "`/`". absoluteUrl can be called with a
   *                 single parameter, where pathOrOptions can be the path
   *                 (String) or the options (Object)
   * @param {Object} [optionalOptions] Optional options
   * @param {Boolean} optionalOptions.secure Create an HTTPS URL.
   * @param {Boolean} optionalOptions.replaceLocalhost Replace localhost with
   *                  127.0.0.1. Useful for services that don't recognize
   *                  localhost as a domain name.
   * @param {String} optionalOptions.rootUrl Override the default ROOT_URL from
   *                 the server environment.
   *                 For example: "`http://foo.example.com`"
   * @returns {String} URL for the given path and options
   */
  absoluteUrl(pathOrOptions, optionalOptions) {
    let path;
    let options;

    // path is optional
    if (!optionalOptions && typeof pathOrOptions === "object") {
      path = undefined;
      options = Object.assign({}, pathOrOptions);
    } else {
      path = pathOrOptions;
      options = Object.assign({}, optionalOptions);
    }

    const hasRootUrl = "rootUrl" in options;

    // presumably, you could simply access window.location.href here, but when
    // we get to server-side rendering, it is better to use a variable that gets
    // assigned when we are sure we are rendering in the browser
    const domain = this.shopDomain();

    if (!hasRootUrl && domain) {
      // unfortunately, the scheme/protocol is not available here, so let's
      // get it from the default Meteor absoluteUrl options, then replace the
      // host
      const rootUrl = url.parse(composeUrl.defaultOptions.rootUrl);
      rootUrl.host = domain;
      options.rootUrl = rootUrl.format();
    }

    return composeUrl(path, options);
  },

  /**
   * getDomain
   * @summary extracts the domain name from the absoluteUrl.
   * @param {Object} [options] inherited from absoluteUrl
   * @param {Boolean} options.replaceLocalhost Replace localhost with 127.0.0.1.
   *                  Useful for services that don't recognize localhost as a
   *                  domain name.
   * @param {String} options.rootUrl Override the default ROOT_URL from the
   *                 server environment. For example: "`http://foo.example.com`"
   * @returns {String} Domain/hostname for the given options
   */
  getDomain(options) {
    const absoluteUrl = this.absoluteUrl(options);

    if (!absoluteUrl) { return null; }

    const { hostname } = url.parse(absoluteUrl);

    return hostname;
  }
};
