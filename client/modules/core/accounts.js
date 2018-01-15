import store from "store";
import { Accounts } from "meteor/accounts-base";
import { Session } from "meteor/session";
import { Random } from "meteor/random";

/*
 * registerLoginHandler
 * method to create anonymous users
 */

Accounts.loginWithAnonymous = function (anonymous, callback) {
  // We need to be sure that every user will work inside a session. Sometimes
  // session could be destroyed, for example, by clearing browser's cache. In
  // that case we need to take care about creating new session before new
  // user or anonymous will be created/logged in.
  // The problem here - looks like where is no way to track localStorage:
  // `store.get("Reaction.session")` itself. That's why we need to use
  // another way: `accounts` package uses `setTimeout` for monitoring connection
  // Accounts.callLoginMethod will be called after clearing cache. We could
  // latch on this computations by running extra check here.
  if (typeof store.get("Reaction.session") !== "string") {
    const newSession = Random.id();
    store.set("Reaction.session", newSession);
    Session.set("sessionId", newSession);
  }
  Accounts.callLoginMethod({
    methodArguments: [{
      anonymous: true,
      sessionId: Session.get("sessionId")
    }],
    userCallback: callback
  });
};
