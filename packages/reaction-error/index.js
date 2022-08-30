/**
 * @name ReactionError
 * @class
 * @memberof GraphQL
 * @summary A type of error that allows additional details to be provided, which can
 *   then be sent back to the client for a GraphQL request.
 */
class ReactionError extends Error {
  constructor(error, message = "", eventData = {}) {
    super(message);

    // In Node (7.2) console.log will print custom errors a bit differently unless all properties are defined as non-enumerable
    Object.defineProperty(this, "name", {
      value: this.constructor.name
    });

    Object.defineProperty(this, "message", {
      value: message
    });

    this.eventData = eventData;
    this.error = error;

    // Newer versions of DDP use this property to signify that an error
    // can be sent back and reconstructed on the calling client.
    this.isClientSafe = true;
    // DDP expects this to be in a property named `reason`
    this.reason = message;
    // DDP expects this to be in a property named `details`
    this.details = eventData;

    // Keep this after everything is defined on `this`
    if ({}.hasOwnProperty.call(Error, "captureStackTrace")) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  clone() {
    return new ReactionError(this.error, this.reason, this.eventData);
  }
}

module.exports = ReactionError;
