import ExtendableError from "es6-error";

/**
 * @name ReactionError
 * @class
 * @memberof GraphQL
 * @summary A type of error that allows additional details to be provided, which can
 *   then be sent back to the client for a GraphQL request.
 */
export default class ReactionError extends ExtendableError {
  constructor(error, message, eventData = {}) {
    super(message);
    this.eventData = eventData;
    this.error = error;
  }
}
