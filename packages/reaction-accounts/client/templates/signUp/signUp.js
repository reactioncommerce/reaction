


Template.loginFormSignUpView.events({
  // *******************************************************
  // Submit the sign in form
  //
  'submit form': function (event, template) {

    event.preventDefault();

    var options = {};

    // var usernameInput = template.$('.login-input--username');
    var emailInput = template.$('.login-input--email');
    var passwordInput = template.$('.login-input--password');

    var email = emailInput.val().trim()
    var password = passwordInput.val().trim()

    var validatedEmail = LoginFormValidation.email(email);
    var validatedPassword = LoginFormValidation.password(password);

    var templateInstance = Template.instance();
    var errors = {};

    templateInstance.formMessages.set({});

    if (validatedEmail !== true ) {
      errors.email = validatedEmail.reason;
    }

    if (validatedPassword !== true) {
      errors.password = validatedPassword;
    }

    if ($.isEmptyObject(errors) === false) {
      templateInstance.formMessages.set({
        errors: errors
      });
      // prevent signup
      return;
    }

    var newUserData = {
      // username: username,
      email: email,
      password: password
    }

    Accounts.createUser(newUserData, function(error, result) {
      if( error ) {
        // Show some error message
        templateInstance.formMessages.set({
          alerts: [error]
        });
      } else {
        // Close dropdown or navigate to page
      }

    });
  }

});


Template.loginFormSignUpView.onCreated(function() {
  this.uniqueId = Random.id();
  this.formMessages = new ReactiveVar({})

  console.log('Sign up created:', this);
})


Template.loginFormSignUpView.helpers(LoginFormSharedHelpers);


Template.loginFormSignUpView.helpers({
  json: function (obj) {
    return JSON.stringify(obj)
  }
});
