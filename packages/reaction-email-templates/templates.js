/**
 * ReactionEmailTemplate - Returns a template source for SSR consumption
 * layout must be defined + template
 * @param {String} template name of the template in either Layouts or fs
 * @returns {Object} returns source
 */
ReactionEmailTemplate = function (template) {
  check(template, String);
  let source;

  const lang = Meteor.call("shop/getLocale").locale.languages;
  // using layout where in the future a more comprehensive rule based
  // filter of the email templates can be implemented.
  const tpl = ReactionCore.Collections.Layouts.findOne({
    template: template
  });

  if (tpl) {
    const tplSource = ReactionCore.Collections.Templates.findOne({
      template: template,
      language: lang
    });
    if (tplSource.source) {
      return tplSource.source;
    }
  }
  let file = `templates/${template}.html`;
  try {
    source = Assets.getText(file);
  } catch (e) { // default blank template
    source = Assets.getText("templates/coreDefault.html");
  }
  return source;
};
