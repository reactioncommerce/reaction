import url from "url";
import Logger from "@reactioncommerce/logger";
import { WebApp } from "meteor/webapp";
import hydra from "./util/hydra";

const { HYDRA_OAUTH2_ERROR_URL, HYDRA_SESSION_LIFESPAN } = process.env;
const errorHandler = (errorMessage, res) => {
  Logger.error(`Error while performing Hydra request - ${errorMessage}`);
  if (HYDRA_OAUTH2_ERROR_URL) {
    Logger.error(`Redirecting to HYDRA_OAUTH2_ERROR_URL: ${HYDRA_OAUTH2_ERROR_URL}`);
    res.writeHead(500, { Location: HYDRA_OAUTH2_ERROR_URL });
    return res.end();
  }
  Logger.warn("No HYDRA_OAUTH2_ERROR_URL set in ENV.");
  return res.end();
};

WebApp.connectHandlers.use("/login", (req, res) => {
  const challenge = req.query.login_challenge;

  hydra.getLoginRequest(challenge)
    .then(async (getLoginRequestRes) => {
      const requestUrl = url.parse(getLoginRequestRes.request_url, true);
      const { loginAction } = requestUrl.query;
      // If Hydra was already able to authenticate the user, skip will be true
      // we do not need to re-authenticate the user.
      if (getLoginRequestRes.skip) {
        const acceptLoginResponse = await hydra.acceptLoginRequest(challenge, {
          subject: getLoginRequestRes.subject
        });
        Logger.debug(`Auth status confirmed from Hydra. Redirecting to: ${acceptLoginResponse.redirect_to}`);
        res.writeHead(301, { Location: acceptLoginResponse.redirect_to });
        return res.end();
      }

      res.writeHead(301, { Location: `/account/login?action=${loginAction}&login_challenge=${challenge}` });
      Logger.debug("Redirecting to Login Form for user login");
      return res.end();
    })
    .catch((errorMessage) => errorHandler(errorMessage, res));
});

WebApp.connectHandlers.use("/consent", (req, res) => {
  const challenge = req.query.consent_challenge;
  // Here, we accept consent directly without presenting a consent form to the user
  // because this was built for a trusted Consumer client.
  // For non-trusted Consumer clients, this should be updated to present a Consent UI to
  // the user grant or deny specific scopes
  hydra
    .acceptConsentRequest(challenge, {
      remember: true,
      remember_for: HYDRA_SESSION_LIFESPAN || 3600, // eslint-disable-line camelcase
      session: {} // we are not adding any extra user, we use only the sub value already present
    })
    .then((consentResponse) => {
      Logger.debug(`Consent call complete. Redirecting to: ${consentResponse.redirect_to}`);
      res.writeHead(301, { Location: consentResponse.redirect_to });
      return res.end();
    })
    .catch((errorMessage) => errorHandler(errorMessage, res));
});
