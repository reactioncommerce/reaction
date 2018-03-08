import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";

/**
 * @file Methods for Account Validation
 * Methods for validating account username, email and password. Methods are exported globally in the `LoginFormValidation` object and they are also registered as Meteor methods. Call the methods using
 * `Meteor.call()` or `LoginFormValidation.method`.
 * @example LoginFormValidation.password(password, { validationLevel: "exists" })
 * @example Meteor.call("accounts/validation/email", newEmail, false, (result, error))
 * @namespace Methods/Accounts/Validation
 */

const validationMethods = {
  /**
   * @name accounts/validation/username
   * @method
   * @memberof Methods/Accounts/Validation
   * @summary Determines if a username meets the minimum requirement of 3 characters
   * @param  {String} username Username to validate
   * @return {Boolean|Object} true if valid, error object if invalid
   */
  username(username) {
    check(username, Match.OptionalOrNull(String));

    // Valid
    if (username.length >= 3) {
      return true;
    }

    // Invalid
    return {
      error: "INVALID_USERNAME",
      reason: "Username must be at least 3 characters long",
      i18nKeyReason: "accountsUI.error.usernameMinLength"
    };
  },

  /**
   * @name accounts/validation/email
   * @method
   * @memberof Methods/Accounts/Validation
   * @summary Validates both required and optional email addresses.
   * @example LoginFormValidation.email(emailAddress)
   * @example Meteor.call("accounts/validation/email", newEmail, false, callbackFunction())
   * @param  {String} email Email address to validate
   * @param  {Boolean} optional If set to true, validation will pass if email is blank
   * @return {Boolean|Object} Returns true if valid; Returns an error object if invalid
   */
  email(email, optional) {
    check(email, Match.OptionalOrNull(String));
    check(optional, Match.OptionalOrNull(Boolean));

    const processedEmail = email.trim();

    // Valid
    if (optional === true && processedEmail.length === 0) {
      return true;
    } else if (processedEmail.indexOf("@") !== -1) {
      return true;
    }

    // Invalid
    return {
      error: "INVALID_EMAIL",
      reason: "Email address is invalid",
      i18nKeyReason: "accountsUI.error.invalidEmail"
    };
  },

  /**
   * @name accounts/validation/password
   * @method
   * @memberof Methods/Accounts/Validation
   * @summary Passwords may be validated 2 ways.
   * 1. "exists" `(options.validationLevel = "exists")` - Password must not be blank.
   * Thats is the only rule. Used to validate a sign in.
   * 2. undefined `(options.validationLevel = undefined)` - Password must meet the lenght and other criteria to validate.
   * Used for validating a new sign up.
   * @example LoginFormValidation.password(pword, { validationLevel: "exists" })
   * @param  {String} password Password to validate
   * @param  {Object} options Options to apply to the password validator
   * @param  {String} options.validationLevel "exists" | undefined (default)
   * @return {Boolean|Object} true if valid | Error object otherwise: {error: String, reason: String}
   */
  password(password, options) {
    check(password, Match.OptionalOrNull(String));
    check(options, Match.OptionalOrNull(Object));

    const passwordOptions = options || {};
    const errors = [];

    // Only check if a password has been entered at all.
    // This is usefull for the login forms
    if (passwordOptions.validationLevel === "exists") {
      if (password && password.length > 0) {
        return true;
      }

      errors.push({
        error: "INVALID_PASSWORD",
        reason: "Password is required",
        i18nKeyReason: "accountsUI.error.passwordRequired"
      });
    } else if (password.length < 6) {
      // Validate the password on some rules
      // This is useful for cases where a password needs to be created or updated.
      errors.push({
        error: "INVALID_PASSWORD",
        reason: "Password must be at least 6 characters long.",
        i18nKeyReason: "accountsUI.error.passwordMustBeAtLeast6CharactersLong"
      });
    }

    if (errors.length) {
      return errors;
    }

    // Otherwise the password is valid
    return true;
  }
};

// Export object globally
export const LoginFormValidation = validationMethods;

// Register validation methods as meteor methods
Meteor.methods({
  "accounts/validation/username": validationMethods.username,
  "accounts/validation/email": validationMethods.email,
  "accounts/validation/password": validationMethods.password
});
