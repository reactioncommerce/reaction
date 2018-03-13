import cuid from "cuid";
import { Logger } from "./meteor";

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
        ...(originalError.eventObj || {})
      };

      Logger.error(eventObj);

      if (typeof originalError.error === "string") type = originalError.error;
    }

    // Add a `type` prop to our `errors` response object for client parsing
    err.type = type;

    return err;
  };
}

export default getErrorFormatter;
