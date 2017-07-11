/**
 * Validation class
 * @summary Helper to streamline getting simple-schema validation in react components
 */
class Validation {
  /**
   * Instantiate with a schema to validate against
   * @param  {SimpleSchema} schema aldeed:simpleschema class
   * @param  {Object} options extra options such as { pick: ["fieldName"] }
   */
  constructor(schema, options) {
    if (options && options.pick) {
      this.validationContext = schema.pick(options.pick).newContext();
    } else {
      this.validationContext = schema.namedContext();
    }

    this.schema = schema;
    this.options = options;
  }

  get cleanOptions() {
    return this.options && this.options.cleanOptions || { getAutoValues: false };
  }

  /**
   * validate
   * @param  {Object} objectToValidate Object to validate against schema
   * @return {Object} object containting {isValid: true|false, validationMessages: undefined|object}
   */
  validate(objectToValidate) {
    const messages = {};

    // clean object, removing fields that aren't in the schema, and convert types
    // based on schema
    const cleanedObject = this.schema.clean(objectToValidate, this.cleanOptions);

    // Validate the cleaned object
    const isValid = this.validationContext.validate(cleanedObject);

    // Avoiding the reactive-stuff built into simple-schema, grab invalid
    // keys from the private var _invalidKeys, and create a new object with
    // the validation error and message.
    this.validationContext._invalidKeys
      .forEach((validationError) => {
        messages[validationError.name] = {
          ...validationError,
          message: this.validationContext.keyErrorMessage(validationError.name)
        };
      });

    // Return object validation status and messages if any
    return {
      isValid,
      messages
    };
  }
}

export default Validation;
