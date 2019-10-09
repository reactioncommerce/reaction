import qs from "querystring";
import fetch from "node-fetch";
import Logger from "@reactioncommerce/logger";
import ReactionError from "@reactioncommerce/reaction-error";

/**
 * Given an Authorization Bearer token it returns a JSON object with user
 * properties and claims found
 *
 * @name expandAuthToken
 * @method
 * @summary Expands an Auth token
 * @param {String} token Auth token
 * @returns {Object} JSON object
 */
export default async function expandAuthToken(token) {
  if (!process.env.HYDRA_OAUTH2_INTROSPECT_URL) {
    Logger.fatal("HYDRA_OAUTH2_INTROSPECT_URL not set in ENV. Auth introspection failed");
    throw new ReactionError("server-error", "Hydra token introspection not configured");
  }

  const res = await fetch(process.env.HYDRA_OAUTH2_INTROSPECT_URL, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    method: "POST",
    body: qs.stringify({ token })
  });

  if (!res.ok) {
    throw new ReactionError("access-denied", "Error introspecting token");
  }

  const tokenObj = await res.json();
  return tokenObj;
}
