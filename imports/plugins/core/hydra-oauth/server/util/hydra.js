import Logger from "@reactioncommerce/logger";
import fetch from "node-fetch";

const { HYDRA_ADMIN_URL } = process.env;
let mockTlsTermination = {};

if (process.env.MOCK_TLS_TERMINATION) {
  mockTlsTermination = {
    "X-Forwarded-Proto": "https"
  };
}

/**
 * @name get
 * @method
 * @private
 * @param  {String} flow Request or Consent
 * @param  {String} challenge To fetch information about the login/consent
 * @return {Object|String} API res
 */
function get(flow, challenge) {
  return fetch(`${HYDRA_ADMIN_URL}/oauth2/auth/requests/${flow}/${challenge}`)
    .then(async (res) => {
      if (res.status < 200 || res.status > 302) {
        const json = await res.json();
        Logger.error(`An error occurred while making GET ${flow}-${challenge} HTTP request to Hydra: `, json.error_description);
        return Promise.reject(new Error(json.error_description));
      }
      return res.json();
    });
}

/**
 * @name put
 * @method
 * @private
 * @param  {String} flow Request or Consent
 * @param  {String} action Accept/Reject
 * @param  {String} challenge To fetch information about the login/consent
 * @param  {String} body Request body
 * @return {Object|String} API res
 */
function put(flow, action, challenge, body) {
  return fetch(`${HYDRA_ADMIN_URL}/oauth2/auth/requests/${flow}/${challenge}/${action}`, {
    method: "PUT",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      ...mockTlsTermination
    }
  })
    .then(async (res) => {
      if (res.status < 200 || res.status > 302) {
        const json = await res.json();
        Logger.error(`An error occurred while making PUT ${flow}-${challenge} request to Hydra: `, json.error_description);
        return Promise.reject(new Error(json.error_description));
      }
      return res.json();
    });
}

export default {
  getLoginRequest: (challenge) => get("login", challenge),
  acceptLoginRequest: (challenge, body) => put("login", "accept", challenge, body),
  rejectLoginRequest: (challenge) => put("login", "reject", challenge),
  getConsentRequest: (challenge) => get("consent", challenge),
  acceptConsentRequest: (challenge, body) => put("consent", "accept", challenge, body),
  rejectConsentRequest: (challenge, body) => put("consent", "reject", challenge, body)
};
