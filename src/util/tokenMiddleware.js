import Logger from "@reactioncommerce/logger";
import getUserFromAuthToken from "./getUserFromAuthToken.js";

/**
 * This middleware wraps the `getUserFrom*Token` functions. It
 * checks to see if an Authorization header was provided. If it was, the token value from that
 * header is passed to `getUserFromAuthToken` and the result is saved on `req.user`.
 *
 * If `getUserFromAuthToken` throws an error, a 401 response is sent. If none of the request headers is
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
    const token = req.headers.authorization;
    if (!token) {
      next();
      return;
    }

    try {
      req.user = await getUserFromAuthToken(token, context);
      next();
    } catch (error) {
      Logger.error(error);
      // Be sure our response is JSON (can't use res.sendStatus)
      res.status(401).json({
        code: 401,
        message: "Unauthorized"
      });
    }
  };
}
