


window.LoginFormValidation = {
  username: function(username) {

    // Valid
    if (username.length >= 3) {
      return true;
    }

    // Invalid
    return {
      "error": "INVALID_USERNAME",
      "reason": "Username must be at least 3 characters long"
    };
  },

  email: function(email, optional) {

    email = email.trim();

    // Valid
    if (optional === true && email.length === 0) {
      return true;
    } else if (email.indexOf('@') !== -1) {
      return true;
    }

    // Invalid
    return {
      error: "INVALID_EMAIL",
      reason: i18n.t('accountsUI.error.invalidEmail')
    };

  },

  password: function(password, options) {

    // Must have one number and/or symbol
    var validPasswordRegex = /^.*(?=.*[a-z])(?=.*[\d\W]).*$/;
    options = options || {};

    // Only check if a password has been entered at all.
    // This is usefull for the login forms
    if (options.validationLevel === 'exists') {
      if (password.length > 0) {
        return true;
      } else {
        return {
          error: "INVALID_PASSWORD",
          reason: i18n.t('accountsUI.error.passwordRequired')
        };
      }
    }

    // ---
    // Validate the password pased on some rules
    // This is useful for cases where a password needs to be created or updated.
    //

    var errors = [];

    if (password.length < 6) {
      errors.push({
        error: "INVALID_PASSWORD",
        reason: i18n.t('accountsUI.error.passwordMustBeAtLeast6CharactersLong')
      });
    }

    if (password.match(validPasswordRegex) === null) {
      errors.push({
        error: "INVALID_PASSWORD",
        reason: i18n.t('accountsUI.error.passwordMustContainRequirements')
      });
    }


    if (errors.length) {
      return errors;
    }

    // Otherwise the password is valid
    return true
  }
};
