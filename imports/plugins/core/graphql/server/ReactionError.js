import ExtendableError from "es6-error";

export default class ReactionError extends ExtendableError {
  constructor(error, message, eventData = {}) {
    super(message);
    this.eventData = eventData;
    this.error = error;
  }
}
