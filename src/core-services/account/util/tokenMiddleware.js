import getUserFromMeteorToken from "./getUserFromMeteorToken.js";
import getUserFromAuthToken from "./getUserFromAuthToken.js";

/**
 * This middleware wraps the `getUserFrom*Token` functions. It
 * checks to see if an Authorization header was provided. If it was, the token value from that
 * header is passed to `getUserFrom*Token` (otherwise it falls back to using a meteor token if
 * present on the request). The result is saved on `req.user`.
 *
 * If `getUserFrom*Token` throws an error, a 401 response is sent. If none of the request headers is
 * set, then the middleware finishes. This means that a token need not be
 * provided, but if one is present, it must be valid to avoid a 401.
 *
 * @name tokenMiddleware
 * @method
 * @memberof GraphQL
 * @summary Express middleware to find user by token.
 * @param {Object} context An object with request-specific state. Just passed through to `getUserFromToken`.
 * @returns {Function} An Express middleware function
 */
export default function tokenMiddleware(context) {
  return async (req, res, next) => {
    let token = req.headers["meteor-login-token"]; // default (fallback) token (meteor)
    const authorizationHeader = req.headers.authorization;

    if (authorizationHeader) {
      token = authorizationHeader;
    }

    if (!token) {
      next();
      return;
    }

    try {
      if (authorizationHeader) {
        req.user = await getUserFromAuthToken(token, context);
      } else {
        req.user = await getUserFromMeteorToken(token, context);
      }
      next();
    } catch (error) {
      res.sendStatus(401);
    }
  };
}
