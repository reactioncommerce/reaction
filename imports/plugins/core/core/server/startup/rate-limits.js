import _ from "lodash";
import { DDPRateLimiter } from "meteor/ddp-rate-limiter";

/**
 * @description rate limit Meteor Accounts methods to two (2) attempts
 * per connection per five (5) seconds
 * @returns {undefined}
 */
export default function setRateLimits() {
  const authMethods = [
    "login",
    "logout",
    "logoutOtherClients",
    "getNewToken",
    "removeOtherTokens",
    "configureLoginService",
    "changePassword",
    "forgotPassword",
    "resetPassword",
    "verifyEmail",
    "createUser",
    "ATRemoveService",
    "ATCreateUserServer",
    "ATResendVerificationEmail"
  ];

  DDPRateLimiter.addRule({
    name: (name) => _.includes(authMethods, name),
    connectionId: () => true
  }, 2, 5000);
}
