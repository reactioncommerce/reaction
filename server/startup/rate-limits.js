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


  /**
   * Rate limit "orders/sendNotification"
   * 1 attempt per connection per 2 seconds
   */
  DDPRateLimiter.addRule({
    name: "orders/sendNotification",
    connectionId: () => true
  }, 1, 2000);
}
