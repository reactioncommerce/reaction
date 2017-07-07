/**
 * Validation class
 * @summary Helper to streamline getting simple-schema validation in react components
 */
class Validation {
  /**
   * Instantiate with a schema to validate against
   * @param  {SimpleSchema} schema aldeed:simpleschema class
   */
  constructor(schema) {
    this.validationContext = schema.namedContext();
    this.schema = schema;
  }

  /**
   * validate
   * @param  {Object} objectToValidate Object to validate against schema
   * @return {Object} object containting {isValid: true|false, validationMessages: undefined|object}
   */
  validate(objectToValidate) {
    const validationMessages = {};

    // clean object, removing fields that aren't in the schema, and convert types
    // based on schema
    const cleanedObject = this.schema.clean(objectToValidate);

    // Validate the cleaned object
    const isValid = this.validationContext.validate(cleanedObject);

    // Avoding the reactive-stuff built into simple-schema, grapy invalid
    // keys from the provate var _invalidKeys, and create a new object with
    // the validation error and message
    this.validationContext._invalidKeys
      .forEach((validationError) => {
        validationMessages[validationError.name] = {
          ...validationError,
          message: this.validationContext.keyErrorMessage(validationError.name)
        };
      });

    // Return object validation status and messages if any
    return {
      isValid,
      validationMessages
    };
  }
}

export default Validation;
