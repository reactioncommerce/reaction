/**
 * @summary Generate an absolute URL pointing to the application. The server
 * reads from the `ROOT_URL` environment variable to determine where it is
 * running. This is taken care of automatically for apps deployed to Galaxy,
 * but must be provided when using `meteor build`.
 * (this code is based on Meteor.absoluteUrl)
 * @param {String} [pathOrOptions] A path to append to the root URL. Do not
 *                 include a leading "`/`".
 * @param {Object} [optionalOptions] URL composition options
 * @param {Boolean} optionalOptions.secure Create an HTTPS URL.
 * @param {Boolean} optionalOptions.replaceLocalhost Replace localhost with
 *                  127.0.0.1. Useful for services that don't recognize
 *                  localhost as a domain name.
 * @param {String} options.rootUrl Override the default ROOT_URL from the server
 *                 environment. For example: "`http://foo.example.com`"
 * @returns {String} the crafted URL
 */
export function composeUrl(pathOrOptions, optionalOptions) {
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
  // merge options with defaults
  options = Object.assign({}, composeUrl.defaultOptions, options || {});

  let url = options.rootUrl;

  if (!url) {
    throw new Error("Must pass options.rootUrl or set ROOT_URL in the server environment");
  }

  if (!/^http[s]?:\/\//i.test(url)) { // url starts with 'http://' or 'https://'
    url = `http://${url}`; // we will later fix to https if options.secure is set
  }

  if (!url.endsWith("/")) {
    url += "/";
  }

  if (path) {
    // join url and path with a / separator
    while (path.startsWith("/")) {
      path = path.slice(1);
    }
    url += path;
  }

  // turn http to https if secure option is set, and we're not talking
  // to localhost.
  if (options.secure &&
      /^http:/.test(url) && // url starts with 'http:'
      !/http:\/\/localhost[:/]/.test(url) && // doesn't match localhost
      !/http:\/\/127\.0\.0\.1[:/]/.test(url)) { // or 127.0.0.1
    url = url.replace(/^http:/, "https:");
  }

  if (options.replaceLocalhost) {
    url = url.replace(/^http:\/\/localhost([:/].*)/, "http://127.0.0.1$1");
  }

  return url;
}

// allow later packages to override default options
composeUrl.defaultOptions = {};

// client-side environment
const location = typeof window === "object" && window.location;

// server-side environment
if (typeof process === "object" && process.env.ROOT_URL) {
  composeUrl.defaultOptions.rootUrl = process.env.ROOT_URL;
} else if (location && location.protocol && location.host) {
  composeUrl.defaultOptions.rootUrl = `${location.protocol}//${location.host}`;
}

// Make absolute URLs use HTTPS by default if the current window.location
// uses HTTPS. Since this is just a default, it can be overridden by
// passing { secure: false } if necessary.
if (location && location.protocol === "https:") {
  composeUrl.defaultOptions.secure = true;
}
