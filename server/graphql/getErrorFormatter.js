import { Logger } from "/server/api";
import { Random } from "meteor/random";

function getErrorFormatter(context) {
  return (err) => {
    const { originalError } = err;

    // Generate an ID that can be used to correlate client errors with this server error
    err.errorId = Random.id();

    if (originalError) {
      const eventObj = {
        errorId: err.error_id,
        path: err.path,
        userId: (context.user && context.user.id) || null,
        ...(originalError.eventObj || {})
      };

      Logger.error(eventObj);

      // Add a `type` prop to our `errors` response object for client parsing
      if (originalError.error) err.type = originalError.error;
    }

    return err;
  };
}

export default getErrorFormatter;
