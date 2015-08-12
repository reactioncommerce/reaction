Template.loginFormResetPasswordView.events({


  // *******************************************************
  // Submit the password reset form
  //
  'submit form': function (event, template) {

    event.preventDefault();

    var emailAddress = template.$('.login-input--email').val().trim();
    var validatedEmail = LoginFormValidation.email(emailAddress);
    var templateInstance = Template.instance();
    var errors = {};

    templateInstance.formMessages.set({});

    if (validatedEmail !== true ) {
      errors.email = validatedEmail.reason;
    }

    if ($.isEmptyObject(errors) === false) {
      templateInstance.formMessages.set({
        errors: errors
      });
      // prevent password reset
      return;
    }

    // Make sure mail is properly configured for this shop before we end anything
    ReactionCore.configureMailUrl();

    Accounts.forgotPassword({ email: emailAddress}, function (error) {
      // Show some message confirming result

      if (error) {
        templateInstance.formMessages.set({
          alerts: [error]
        });
      } {
        templateInstance.formMessages.set({
          info: [{
            reason: i18n.t('accountsUI.info.passwordResetSend')
          }]
        });
      }
    });

  }

});




Template.loginFormResetPasswordView.onCreated(function () {
  this.uniqueId = Random.id();
  this.formMessages = new ReactiveVar({})
});


Template.loginFormResetPasswordView.helpers(LoginFormSharedHelpers);
