
/**
 * Make sure initial admin user has verified their
 * email before allowing them to login.
 *
 * http://docs.meteor.com/#/full/accounts_validateloginattempt
 */

Accounts.validateLoginAttempt(function(attempt) {

  if (!attempt.allowed) {
    return false;
  }

  // confirm this is the accounts-password login method
  if (attempt.type !== "password" || attempt.methodName !== "login") {
    return attempt.allowed;
  }

  if (!attempt.user) {
    return attempt.allowed;
  }

  var loginEmail = attempt.methodArguments[0].user.email;
  var adminEmail = process.env.METEOR_EMAIL;

  if (loginEmail && loginEmail === adminEmail) {
    // filter out the matching login email from any existing emails
    var email = _.filter(attempt.user.emails, function(email) {
      return email.address === loginEmail;
    });

    // check if the email is verified
    if (!email.length || !email[0].verified) {
      throw new Meteor.Error(403, 'Oops! Please validate your email first.');
    }
  }

  return attempt.allowed;
});
