import {
  ReactionEventsEnumMapping
} from "./enums.js";

export function validateTopic(topic) {
  if (!topic) {
    return false;
  }

  return Object.values(ReactionEventsEnumMapping).includes(topic);
}
