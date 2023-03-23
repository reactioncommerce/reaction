import {
  ReactionEventsEnumMapping
} from "./util/enums.js";

import {
  handleEvent
} from "./service/webhookHandler.js";

/**
 * @summary Add an event listener for each supported webhook event
 * @param {Object} context - The per-request app context
 * @returns {void}
 */
export default function webhooksStartup(context) {
  const {
    appEvents
  } = context;

  for (const eventType of Object.keys(ReactionEventsEnumMapping)) {
    appEvents.on(eventType, async (eventData) => {
      await handleEvent(
        eventType,
        eventData,
        context
      );
    });
  }
}
