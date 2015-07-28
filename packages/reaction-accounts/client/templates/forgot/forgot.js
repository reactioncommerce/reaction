Template.loginFormResetPasswordView.events({


  // *******************************************************
  // Submit the password reset form
  //
  'click .action--submit': function (event, template) {

    var emailAddress = template.$('.login-input--email').val().trim();
    var validatedEmail = LoginFormValidation.email(emailAddress);
    var errors = {};

    if (validatedEmail !== true ) {
      errors.email = validatedEmail.reason;
    }

    if ($.isEmptyObject(errors) === false) {
      Template.instance().formErrors.set(errors);
      // prevent password reset
      return;
    }

    Accounts.forgotPassword({ email: emailAddress}, function (error) {
      // Show some message confirming result

      if (error) {
        console.log('Error', error);
      } {
        console.log('success');
      }
    });

  }

});




Template.loginFormResetPasswordView.onCreated(function () {
  this.uniqueId = Random.id();
  this.formErrors = new ReactiveVar({})
});


Template.loginFormResetPasswordView.helpers(LoginFormSharedHelpers);
