import Logger from "@reactioncommerce/logger";
import { WebApp } from "meteor/webapp";
import hydra from "./util/hydra";

WebApp.connectHandlers.use("/login", (req, res) => {
  console.log("/login connected");
  // The challenge is used to fetch information about the login request from ORY Hydra.
  const challenge = req.query.login_challenge;

  hydra.getLoginRequest(challenge)
    // This will be called if the HTTP request was successful
    .then((getLoginRequestRes) => {
      // If hydra was already able to authenticate the user, skip will be true and we do not need to re-authenticate
      // the user.
      if (getLoginRequestRes.skip) {
        return hydra
          .acceptLoginRequest(challenge, { subject: getLoginRequestRes.subject })
          .then((AcceptLoginResponse) => res.redirect(AcceptLoginResponse.redirect_to));
      }

      // If authentication can't be skipped we MUST show the login UI.
      res.writeHead(301, { Location: `/account/login?login_challenge=${challenge}` });
      return res.end();
    })
    .catch((error) => Logger.debug(error));
});

WebApp.connectHandlers.use("/consent", (req, res) => {
  // The challenge is used to fetch information about the consent request from ORY Hydra.
  const challenge = req.query.consent_challenge;

  hydra
    .acceptConsentRequest(challenge, {
      // The session allows us to set session data for id and access tokens
      session: {
        // This data will be available when introspecting the token. Try to avoid sensitive information here,
        // unless you limit who can introspect tokens.
        access_token: { foo: "bar" },

        // This data will be available in the ID token.
        id_token: { baz: "bar" }
      }
    })
    // All we need to do now is to redirect the user back to hydra!
    .then((AcceptResponse) => {
      res.writeHead(301, { Location: AcceptResponse.redirect_to });
      return res.end();
    })
    .catch((error) => Logger.debug(error));
});
