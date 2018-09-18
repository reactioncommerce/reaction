import Logger from "@reactioncommerce/logger";
import { WebApp } from "meteor/webapp";
import hydra from "./util/hydra";

const { HYDRA_OAUTH2_ERROR_URL } = process.env;
const errorHandler = (errorMessage, res) => {
  Logger.error(`Error while performing Hydra login request - ${errorMessage}`);
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
      // If Hydra was already able to authenticate the user, skip will be true
      // and there will be no need to present a login form to the user.
      if (getLoginRequestRes.skip) {
        const acceptLoginResponse = await hydra.acceptLoginRequest(challenge, {
          subject: getLoginRequestRes.subject
        });
        Logger.debug(`Auth status confirmed from Hydra. Redirecting to: ${acceptLoginResponse.redirect_to}`);
        res.redirect(acceptLoginResponse.redirect_to);
      }

      res.writeHead(301, { Location: `/account/login?login_challenge=${challenge}` });
      Logger.debug("Redirecting to Login Form for user login");
      return res.end();
    })
    .catch((errorMessage) => errorHandler(errorMessage, res));
});

WebApp.connectHandlers.use("/consent", (req, res) => {
  const challenge = req.query.consent_challenge;
  // Call acceptConsent without presenting a consent form to the user
  hydra
    .acceptConsentRequest(challenge, {})
    .then((consentResponse) => {
      Logger.debug(`Consent call complete. Redirecting to: ${consentResponse.redirect_to}`);
      res.writeHead(301, { Location: consentResponse.redirect_to });
      return res.end();
    })
    .catch((errorMessage) => errorHandler(errorMessage, res));
});
