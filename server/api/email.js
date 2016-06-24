import { Packages, Templates } from "/lib/collections";

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
