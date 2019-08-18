/* eslint-disable node/no-deprecated-api */
/* TODO: revisit `url.parse` throughout Reaction */
import url from "url";
import { DDP } from "meteor/ddp-client";
import { composeUrl } from "/lib/core/url-common";

export const AbsoluteUrlMixin = {
  /**
   * connectionDomain
   * @summary inspects the current connection to the client to get the host
   * @returns {String} - the current host (domain sans protocol) or undefined
   */
  connectionDomain() {
    const invocation =
      DDP._CurrentMethodInvocation.get() ||
      DDP._CurrentPublicationInvocation.get();

    if (!invocation) { return null; }

    const { connection } = invocation;

    if (!connection) { return null; }

    return connection.httpHeaders.host;
  },

  /**
   * absoluteUrl
   * @summary a wrapper method for Meteor.absoluteUrl which sets the rootUrl to
   * the current URL (instead of defaulting to ROOT_URL)
   * @param {String} [pathOrOptions] A path to append to the root URL. Do not include a leading "`/`".
   *                                 absoluteUrl can be called with a single
   *                                 parameter, where pathOrOptions can be the
   *                                 path (String) or the options (Object)
   * @param {Object} [optionalOptions] Optional options
   * @param {Boolean} optionalOptions.secure Create an HTTPS URL.
   * @param {Boolean} optionalOptions.replaceLocalhost Replace localhost with 127.0.0.1. Useful for services that don't recognize localhost as a domain name.
   * @param {String} optionalOptions.rootUrl Override the default ROOT_URL from the server environment. For example: "`http://foo.example.com`"
   * @returns {String} - the constructed URL
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

    if (!hasRootUrl) {
      const domain = this.connectionDomain();

      if (domain) {
        // composeUrl will default to http unless the scheme is set on rootUrl.
        // the "connection domain" does not inform us of ssl, so we use
        // composeUrl.defaultOptions.rootUrl to inform us (i.e., if this is
        // returning "http://" update your $ROOT_URL)
        const rootUrl = url.parse(composeUrl.defaultOptions.rootUrl);
        rootUrl.host = domain;
        options.rootUrl = rootUrl.format();
      }
    }

    return composeUrl(path, options);
  },

  /**
   * @name getDomain
   * @method
   * @memberof Core
   * @summary Get shop domain for URL
   * @returns {String} Shop domain
   */
  getDomain() {
    return url.parse(this.absoluteUrl()).hostname;
  }
};
