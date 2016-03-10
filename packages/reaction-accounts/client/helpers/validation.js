
window.LoginFormValidation = {
  /**
   * Username validation
   * @summary Determins if a username meets the minimum requirement of 3 characters
   * @param  {String} username Username to validate
   * @return {Boolean|Object} true if valid, error object if invalid
   */
  username(username) {
    // Valid
    if (username.length >= 3) {
      return true;
    }

    // Invalid
    return {
      error: "INVALID_USERNAME",
      reason: "Username must be at least 3 characters long"
    };
  },

  /**
   * Email validation
   * @summary Validates both required and optional email addresses.
   * @param  {String} email Email address to validate
   * @param  {Boolean} optional If set to true, validation will pass if email is blank
   * @return {Boolean|Object} Returns true if valid; Returns an error object if invalid
   */
  email(email, optional) {
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
      reason: i18next.t("accountsUI.error.invalidEmail")
    };
  },

  /**
   * Password validation
   * Passwords may be validated 2 ways.
   * "exists" (options.validationLevel = "exists") - Password must not be blank. Thats is the only rule. Used to validate a sign in.
   * undefined (options.validationLevel = undefined) - Password must meet the lenght and other criteria to validate. Used for validating a new sign up.
   * @param  {String} password Password to validate
   * @param  {Object} options Options to apply to the password validator
   * @param  {String} options.validationLevel "exists" | undefined (default)
   * @return {Boolean|{error: String, reason: String}} true if valid | Error object otherwise
   */
  password(password, options) {
    // Must have one number and/or symbol
    const validPasswordRegex = /^.*(?=.*[a-zA-Z])(?=.*[\d\W]).*$/;
    const passwordOptions = options || {};

    // Only check if a password has been entered at all.
    // This is usefull for the login forms
    if (passwordOptions.validationLevel === "exists") {
      if (password.length > 0) {
        return true;
      }

      return {
        error: "INVALID_PASSWORD",
        reason: i18next.t("accountsUI.error.passwordRequired")
      };
    }

    // ---
    // Validate the password pased on some rules
    // This is useful for cases where a password needs to be created or updated.
    //
    let errors = [];

    if (password.length < 6) {
      errors.push({
        error: "INVALID_PASSWORD",
        reason: i18next.t("accountsUI.error.passwordMustBeAtLeast6CharactersLong")
      });
    }

    if (password.match(validPasswordRegex) === null) {
      errors.push({
        error: "INVALID_PASSWORD",
        reason: i18next.t("accountsUI.error.passwordMustContainRequirements")
      });
    }


    if (errors.length) {
      return errors;
    }

    // Otherwise the password is valid
    return true;
  }
};
