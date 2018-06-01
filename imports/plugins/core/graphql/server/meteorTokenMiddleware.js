import getUserFromToken from "./getUserFromToken";

/**
 * This middleware wraps the `getUserFromToken` function. Given a header name, it
 * checks to see if that header was provided. If it was, the token value from that
 * header is passed to `getUserFromToken` and the result is saved on `req.user`.
 *
 * If `getUserFromToken` throws, a 401 response is sent. If the request header is
 * not set, then the middleware finishes. This means that a token need not be
 * provided, but if one is present, it must be valid to avoid a 401.
 *
 * @name meteorTokenMiddleware
 * @method
 * @memberof GraphQL
 * @summary Express middleware to find user by token.
 * @param {String} headerName The name of the HTTP header that should have a token
 * @param {Object} context An object with request-specific state. Just passed through to `getUserFromToken`.
 * @returns {Function} An Express middleware function
 */
export default function meteorTokenMiddleware(headerName, context) {
  return async (req, res, next) => {
    // get the login token from the headers request, given by the Meteor's
    // network interface middleware if enabled
    const token = req.headers[headerName];

    if (!token) {
      next();
      return;
    }

    try {
      // get the current user
      req.user = await getUserFromToken(token, context);
      next();
    } catch (error) {
      res.sendStatus(401);
    }
  };
}
