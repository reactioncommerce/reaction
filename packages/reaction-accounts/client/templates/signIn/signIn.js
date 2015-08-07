
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

    var errors = {};

    if (validatedEmail !== true ) {
      errors.email = validatedEmail.reason;
    }

    if (validatedPassword !== true) {
      errors.password = validatedPassword.reason;
    }

    if ($.isEmptyObject(errors) === false) {
      Template.instance().formErrors.set(errors);
      // prevent login
      return;
    }

    Meteor.loginWithPassword(username, password, function(error, result) {
      if( error ) {
        // Show some error message
        console.log(error)
      } else {
        // Close dropdown or navigate to page
      }

    });
  }

});


Template.loginFormSignInView.onCreated(function() {
  this.uniqueId = Random.id();
  this.formErrors = new ReactiveVar({})
})


Template.loginFormSignInView.helpers(LoginFormSharedHelpers);


