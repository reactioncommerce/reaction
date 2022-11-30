import cuid from "cuid";
import { unwrapResolverError } from "@apollo/server/errors";
import { Logger } from "./logger.js"; // using Logger indirectly so that the unit tests can mock it

/**
 * @name getErrorFormatter
 * @method
 * @memberof GraphQL
 * @summary Returns an error formatting
 *   function for use as the `formatError` option when making an ApolloServer instance
 * @param {Object} context An object with request-specific state
 * @returns {Function} The error formatter function
 */
function getErrorFormatter() {
  return (formattedError, error) => {
    const originalError = unwrapResolverError(error);
    const err = formattedError;

    // Generate an ID that can be used to correlate client errors with this server error
    err.errorId = cuid();

    let type = "unknown";
    let details = [];
    if (originalError) {
      const eventObj = {
        errorId: err.errorId,
        path: err.path,
        stack: originalError.stack,
        ...(originalError.eventData || {})
      };

      if (typeof originalError.error === "string") type = originalError.error;

      if (type === "validation-error" && originalError.details && originalError.details.length) {
        err.message = originalError.details[0].message;
        ({ details } = originalError);
        err.details = details;
      } else {
        err.message = originalError.message;
      }

      // There is no need to log access denied since it's an expected part of API requests
      // and it will be clear to the calling client what the problem is
      if (type !== "access-denied") {
        Logger.error(eventObj, err.message || "ApolloServer error with no message");
      }
    }

    // Add a `type` prop to our `errors` response object for client parsing
    err.type = type;

    // Also try to match how throwing an ApolloError looks.
    // For now we are not throwing ApolloErrors directly because we need errors that
    // also are understood and returned to the client properly by DDP.
    switch (type) {
      case "validation-error":
        if (!err.extensions) err.extensions = {};
        err.extensions.code = "BAD_USER_INPUT";
        if (!err.extensions.exception) err.extensions.exception = {};
        err.extensions.exception.details = details;
        break;

      case "access-denied":
        if (!err.extensions) err.extensions = {};
        err.extensions.code = "FORBIDDEN";
        break;

      case "not-found":
        if (!err.extensions) err.extensions = {};
        err.extensions.code = "NOT_FOUND";
        break;

      default:
    }

    err.extensions.exception = { ...originalError };

    return err;
  };
}

export default getErrorFormatter;
