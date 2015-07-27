Template.loginFormResetPasswordView.events({


  // *******************************************************
  // Submit the password reset form
  //
  '.click .action--submit': function (event, template) {

    var emailAddress = template.$('.login-input--email').val().trim();

    Accounts.forgotPassword({ email: emailAddress}, function () {
      // Show some message confirming result
    });

  }

});

