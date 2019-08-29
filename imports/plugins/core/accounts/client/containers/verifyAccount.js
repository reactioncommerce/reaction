import { Accounts } from "meteor/accounts-base";
import { ReactiveVar } from "meteor/reactive-var";
import { Meteor } from "meteor/meteor";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import VerifyAccount from "../components/verifyAccount";
import { Reaction } from "/client/api";


const verified = new ReactiveVar(null);

Accounts.onEmailVerificationLink((token, done) => {
  Accounts.verifyEmail(token, (error) => {
    if (error) {
      verified.set({
        error: {
          reason: error.reason
          // no i18nKey for framework errors for now
        }
      });
    } else {
      verified.set(true);
    }
    Reaction.Router.go("account/verify");
    done();
  });
});

/**
 * @private
 * @param {Object} props Props
 * @param {Function} onData Call this to update props
 * @returns {undefined}
 */
function wrapper(props, onData) {
  Meteor.setTimeout(() => {
    if (!verified.get()) {
      onData(null, {
        error: {
          defaultValue: "Verification timed out. Probably you've already been verified successfully.",
          i18nKey: "accountsUI.error.verifyTimeout"
        }
      });
      Meteor.setTimeout(() => {
        Reaction.Router.go("/");
      }, 2000);
    }
  }, 5000);

  const user = Meteor.user();
  if (user && verified.get() === true) {
    for (const email of user.emails) {
      if (email.verified === true) {
        Meteor.call("accounts/verifyAccount", (error, affectedDocs) => {
          if (error) {
            onData(null, {
              error: {
                reason: error.reason
                // no i18nKey for framework errors for now
              }
            });
            return;
          }
          if (affectedDocs === 0) {
            onData(null, {
              error: {
                reason: "Couldn't verify email address.",
                i18nKey: "accountsUI.error.verifyEmailAddressNotFound"
              }
            });
            return;
          }
          // Success
          onData(null, {});
        });
      }
    }
  }
  onData(null, verified.get());
}

registerComponent("VerifyAccount", VerifyAccount, composeWithTracker(wrapper));
