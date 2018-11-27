import cuid from "cuid";
import { Logger } from "./logger";

/**
 * @name getErrorFormatter
 * @method
 * @memberof GraphQL
 * @summary Given the current context, returns a context-specific error formatting
 *   function for use as the `formatError` option when calling `graphqlExpress` from
 *   the `apollo-server-express` package.
 * @param {Object} context An object with request-specific state
 * @returns {Function} The error formatter function
 */
function getErrorFormatter(context = {}) {
  return (err) => {
    const { originalError } = err;

    // Generate an ID that can be used to correlate client errors with this server error
    err.errorId = cuid();

    let type = "unknown";
    if (originalError) {
      const eventObj = {
        errorId: err.errorId,
        path: err.path,
        userId: (context.user && context.user._id) || null,
        ...(originalError.eventData || {})
      };

      Logger.error(eventObj);

      if (typeof originalError.error === "string") type = originalError.error;

      if (type === "validation-error" && originalError.details && originalError.details.length) {
        err.message = originalError.details[0].message;
        err.details = originalError.details;
      } else {
        err.message = originalError.message;
      }
    }

    // Add a `type` prop to our `errors` response object for client parsing
    err.type = type;

    return err;
  };
}

export default getErrorFormatter;
