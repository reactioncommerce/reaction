import urlParser from "url";
import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { SSR } from "meteor/meteorhacks:ssr";
import { Packages, Templates } from "/lib/collections";
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


/**
 * ReactionEmailTemplate - Returns a template source for SSR consumption
 * layout must be defined + template
 * @param {String} template name of the template in either Layouts or fs
 * @returns {Object} returns source
 */
ReactionEmailTemplate = function (template) {
  check(template, String);
  let source;
  let lang = "en";

  const shopLocale = Meteor.call("shop/getLocale");

  if (shopLocale && shopLocale.locale && shopLocale.locale.languages) {
    lang = shopLocale.locale.languages;
  }

  // using layout where in the future a more comprehensive rule based
  // filter of the email templates can be implemented.
  const tpl = Packages.findOne({
    "layout.template": template
  });

  if (tpl) {
    const tplSource = Templates.findOne({
      template: template,
      language: lang
    });
    if (tplSource.source) {
      return tplSource.source;
    }
  }
  let file = `email/templates/${template}.html`;
  try {
    source = Assets.getText(file);
  } catch (e) { // default blank template
    source = Assets.getText("email/templates/coreDefault.html");
  }
  return source;
};
