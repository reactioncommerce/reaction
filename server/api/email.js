import urlParser from "url";
import { Accounts } from "meteor/accounts-base";
import { SSR } from "meteor/meteorhacks:ssr";
import { Reaction, Logger } from "/server/api";

const shopName = Reaction.getShopName() || "Reaction";
const shopEmail = Reaction.getShopEmail() || "hello@reactioncommerce.com";

/**
 * Accounts Email Configs
 */
Accounts.emailTemplates.siteName = shopName;
Accounts.emailTemplates.from = `${shopName} <${shopEmail}>`;

Accounts.emailTemplates.verifyEmail.subject = () => {
  return "Your account is almost ready! Just one more step...";
};

// render the custom email verification template
Accounts.emailTemplates.verifyEmail.html = (user, url) => {
  let emailTemplate;
  try {
    emailTemplate = Assets.getText("email/templates/accounts/verify_email.html");
  } catch (e) {
    Logger.error(e);
    throw new Error(e);
  }

  SSR.compileTemplate("verify-email", emailTemplate);

  const domain = urlParser.parse(url).hostname;
  const email = user.emails[0].address;

  return SSR.render("verify-email", { url, domain, email });
};
