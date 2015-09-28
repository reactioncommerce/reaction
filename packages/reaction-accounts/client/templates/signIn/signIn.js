
Template.loginFormSignInView.events({
  // *******************************************************
  // Submit the sign in form
  //
  "submit form": (event, template) => {

    event.preventDefault();

    let options = {};

    let usernameInput = template.$('.login-input--email');
    let passwordInput = template.$('.login-input--password');

    let username = usernameInput.val().trim()
    let password = passwordInput.val().trim()

    let validatedEmail = LoginFormValidation.email(username);
    let validatedPassword = LoginFormValidation.password(password, {validationLevel: 'exists'});

    let templateInstance = Template.instance();
    let errors = {};

    templateInstance.formMessages.set({});

    if (validatedEmail !== true) {
      errors.email = validatedEmail.reason;
    }

    if (validatedPassword !== true) {
      errors.password = validatedPassword.reason;
    }

    if ($.isEmptyObject(errors) === false) {
      templateInstance.formMessages.set({
        errors: errors
      });
      // prevent password reset
      return;
    }

    Meteor.loginWithPassword(username, password, (error, result) => {
      if( error ) {
        // Show some error messages above the form fields
        templateInstance.formMessages.set({
          alerts: [error]
        });

      } else {
        // Close dropdown or navigate to page
      }

    });
  }

});


Template.loginFormSignInView.onCreated(function() {
  this.uniqueId = Random.id();
  this.formMessages = new ReactiveVar({});
});


Template.loginFormSignInView.helpers(LoginFormSharedHelpers);
