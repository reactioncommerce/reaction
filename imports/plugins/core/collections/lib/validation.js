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
    this.validationStatus = {
      isValid: undefined,
      fields: {},
      messages: {},
      isFieldValid: this.isFieldValid
    };
  }

  get cleanOptions() {
    return (this.options && this.options.cleanOptions) || { getAutoValues: false };
  }

  /**
   * validate
   * @param  {Object} objectToValidate Object to validate against schema
   * @return {Object} object containting {isValid: true|false, validationMessages: undefined|object}
   */
  validate(objectToValidate) {
    const messages = {};
    const fields = {};

    // clean object, removing fields that aren't in the schema, and convert types
    // based on schema
    const cleanedObject = this.schema.clean(objectToValidate, this.cleanOptions);

    // Validate the cleaned object
    const isValid = this.validationContext.validate(cleanedObject);

    // Avoiding the reactive-stuff built into simple-schema, grab invalid
    // keys from the private var _validationErrors, and create a new object with
    // the validation error and message.
    this.validationContext._validationErrors
      .forEach((validationError) => {
        messages[validationError.name] = {
          ...validationError,
          isValid: false,
          message: this.validationContext.keyErrorMessage(validationError.name)
        };
      });

    for (const fieldName of Object.keys(cleanedObject)) {
      const hasMessage = messages[fieldName];

      fields[fieldName] = {
        isValid: !hasMessage,
        value: cleanedObject[fieldName]
      };
    }


    // Set the current validation status of the validated object on class instance
    this.validationStatus = {
      isValid,
      fields,
      messages,
      isFieldValid: this.isFieldValid
    };

    // Return object validation status, fields, and helpers
    return this.validationStatus;
  }

  /**
   * isFieldValid - get status of a field after running `validate`
   * @param  {String} fieldName Name of field to check status
   * @return {Boolean} `true` if valid / `false` if not valid / `undefined` if unknown or not yet tested
   */
  isFieldValid = (fieldName) => {
    const field = this.validationStatus.fields[fieldName];
    return field && field.isValid;
  }
}

export default Validation;
