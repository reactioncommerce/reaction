import envalid from "envalid";
import Logger from "@reactioncommerce/logger";
import getConfigFromMailUrl from "./util/getConfigFromMailUrl.js";

const { bool, str } = envalid;

const config = envalid.cleanEnv(process.env, {
  EMAIL_DEBUG: bool({
    default: false
  }),
  MAIL_URL: str({
    desc: "An SMTP mail url, i.e. smtp://user:pass@example.com:465",
    default: ""
  })
}, {
  dotEnvPath: null
});

export const SMTPConfig = { logger: config.EMAIL_DEBUG };

// Parse the MAIL_URL and add the parsed config
if (typeof config.MAIL_URL === "string" && config.MAIL_URL.length) {
  Object.assign(SMTPConfig, getConfigFromMailUrl(config.MAIL_URL));

  const logConfig = { ...SMTPConfig };
  if (SMTPConfig.auth) {
    // Hide password from auth logging
    logConfig.auth = {
      user: SMTPConfig.auth.user,
      pass: "*".repeat(SMTPConfig.auth.pass.length)
    };
  }
  Logger.debug(logConfig, "Parsed SMTP email config");
}

export default config;
