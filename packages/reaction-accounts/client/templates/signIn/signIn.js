
Template.loginFormSignInView.events({
  // *******************************************************
  // Submit the sign in form
  //
  'submit form': function (event, template) {

    event.preventDefault();

    var options = {};

    var usernameInput = template.$('.login-input--email');
    var passwordInput = template.$('.login-input--password');

    var username = usernameInput.val().trim()
    var password = passwordInput.val().trim()

    var validatedEmail = LoginFormValidation.email(username);
    var validatedPassword = LoginFormValidation.password(password, {validationLevel: 'exists'});

    var templateInstance = Template.instance();
    var errors = {};

    templateInstance.formMessages.set({});

    if (validatedEmail !== true ) {
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

    Meteor.loginWithPassword(username, password, function(error, result) {
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
  this.formMessages = new ReactiveVar({})
})


Template.loginFormSignInView.helpers(LoginFormSharedHelpers);


