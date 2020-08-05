import fetch from "node-fetch";
import config from "../config.js";

const { HYDRA_OAUTH2_INTROSPECT_URL, MOCK_TLS_TERMINATION } = config;

let mockTlsTermination = {};
if (MOCK_TLS_TERMINATION) {
  mockTlsTermination = {
    "X-Forwarded-Proto": "https"
  };
}

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
  const response = await fetch(HYDRA_OAUTH2_INTROSPECT_URL, {
    headers: { "Content-Type": "application/x-www-form-urlencoded", ...mockTlsTermination },
    method: "POST",
    body: `token=${encodeURIComponent(token)}`
  });

  if (!response.ok) throw new Error("Error introspecting token");

  return response.json();
}
