/**
 * @summary Verifies that appEvents option has the expected
 *   function properties.
 * @param {Object} appEvents An appEvents object that was passed as an option.
 * @return {undefined} Throws if it's invalid
 */
export default function checkAppEventsInterface(appEvents) {
  const missing = [];

  ["emit", "on", "resume", "stop"].forEach((prop) => {
    if (typeof appEvents[prop] !== "function") {
      missing.push(prop);
    }
  });

  if (missing.length > 0) {
    throw new Error(`appEvents is missing the following required function properties: ${missing.join(", ")}`);
  }
}
