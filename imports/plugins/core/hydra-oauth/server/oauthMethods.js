import { check, Match } from "meteor/check";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import Logger from "@reactioncommerce/logger";
import hydra from "./util/hydra";

const { HYDRA_SESSION_LIFESPAN } = process.env;

/**
 * @name oauthLogin
 * @method
 * @param  {Object} options - options passed from client call
 * @param {String} options.challenge Used to fetch information about the login request from Hydra.
 * @param {Boolean} options.remember tells hydra to remember the browser and automatically authenticate the user in future requests
 * @returns {String} redirectUrl
 */
export function oauthLogin(options) {
  check(options, Object);
  check(options.challenge, String);
  check(options.remember, Match.Maybe(Boolean));
  const { challenge, remember = true } = options;

  return hydra
    .acceptLoginRequest(challenge, {
      subject: Reaction.getUserId(),
      remember,
      // `remember` tells Hydra to remember this login and reuse it if the same user on the same
      // client tries to log-in again. Ideally, this should be longer than token lifespan.
      // Set default is 24 hrs (set in seconds). Depending on preferred setup, you can allow
      // users decide if to enable or disable.
      // eslint-disable-next-line camelcase
      remember_for: HYDRA_SESSION_LIFESPAN ? Number(HYDRA_SESSION_LIFESPAN) : 86400
    })
    .then((response) => response.redirect_to)
    .catch((error) => {
      Logger.error(error);
      throw error;
    });
}
