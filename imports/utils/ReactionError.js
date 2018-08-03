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
    // Newer versions of DDP use this property to signify that an error
    // can be sent back and reconstructed on the calling client.
    this.isClientSafe = true;
    // DDP expects this to be in a property named `reason`
    this.reason = message;
    // DDP expects this to be in a property named `details`
    this.details = eventData;
  }

  clone() {
    return new ReactionError(this.error, this.reason, this.eventData);
  }
}
