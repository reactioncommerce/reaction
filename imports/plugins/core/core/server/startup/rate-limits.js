import _ from "lodash";
import { DDPRateLimiter } from "meteor/ddp-rate-limiter";


export default function setRateLimits() {
  /**
   * Rate limit Meteor Accounts methods
   * 2 attempts per connection per 5 seconds
   */
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
