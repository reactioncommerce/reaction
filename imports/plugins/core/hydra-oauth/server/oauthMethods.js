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
 * @return {String} redirectUrl
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
      remember_for: HYDRA_SESSION_LIFESPAN ? Number(HYDRA_SESSION_LIFESPAN) : 3600 // eslint-disable-line camelcase
    })
    .then((response) => response.redirect_to)
    .catch((error) => {
      Logger.error(error);
      throw error;
    });
}
