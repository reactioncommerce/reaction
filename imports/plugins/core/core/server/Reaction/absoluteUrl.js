import url from "url";
import { Meteor } from "meteor/meteor";
import { DDP } from "meteor/ddp-client";

export const AbsoluteUrlMixin = {
  /**
   * connectionDomain
   * @summary inspects the current connection to the client to get the host
   * @return {String} - the current host (domain sans protocol) or undefined
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
   * @param {Object} [options] Optional options
   * @param {Boolean} options.secure Create an HTTPS URL.
   * @param {Boolean} options.replaceLocalhost Replace localhost with 127.0.0.1. Useful for services that don't recognize localhost as a domain name.
   * @param {String} options.rootUrl Override the default ROOT_URL from the server environment. For example: "`http://foo.example.com`"
   * @return {String} - the constructed URL
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

    if (!hasRootUrl) {
      const domain = this.connectionDomain();

      if (domain) {
        // Meteor.absoluteUrl will default to http unless the scheme is set on
        // rootUrl. the "connection domain" does not inform us of ssl, so we
        // use Meteor.rootUrl to inform us (i.e., if this is returning "http://"
        // update your $ROOT_URL)
        const rootUrl = url.parse(Meteor.absoluteUrl.defaultOptions.rootUrl);
        rootUrl.host = domain;
        opts.rootUrl = rootUrl.format();
      }
    }

    return Meteor.absoluteUrl(path, opts);
  },

  /**
   * @name getDomain
   * @method
   * @memberof Core
   * @summary Get shop domain for URL
   * @return {String} Shop domain
   */
  getDomain() {
    return url.parse(this.absoluteUrl()).hostname;
  }
};
