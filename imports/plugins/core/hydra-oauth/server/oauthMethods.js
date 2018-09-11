import { check, Match } from "meteor/check";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import Logger from "@reactioncommerce/logger";
import hydra from "./util/hydra";

export function oauthLogin(challenge) {
  check(challenge, Match.Maybe(String));

  // Seems like the user authenticated! Let's tell hydra...
  return hydra
    .acceptLoginRequest(challenge, {
      // Subject is an alias for user ID. A subject can be a random string, a UUID, an email address, ....
      subject: Reaction.getUserId(),

      // This tells hydra to remember the browser and automatically authenticate the user in future requests. This will
      // set the "skip" parameter in the other route to true on subsequent requests!
      remember: false, // Boolean(req.body.remember),

      // When the session expires, in seconds. Set this to 0 so it will never expire.
      remember_for: 3600

      // Sets which "level" (e.g. 2-factor authentication) of authentication the user has. The value is really arbitrary
      // and optional. In the context of OpenID Connect, a value of 0 indicates the lowest authorization level.
      // acr: '0',
    })
    .then((response) => response.redirect_to)
    .catch((error) => {
      Logger.error(error);
      throw error;
    });
}
