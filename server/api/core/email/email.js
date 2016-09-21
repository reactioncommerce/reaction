import { Meteor } from "meteor/meteor";
import { Job } from "meteor/vsivsi:job-collection";
import { Jobs, Templates } from "/lib/collections";
import { Logger } from "/server/api";


/**
 * Reaction.Email.send()
 * (Job API doc) https://github.com/vsivsi/meteor-job-collection/#user-content-job-api
 * @param  {Object} options - object containing to/from/subject/html String keys
 * @return {Boolean} returns job object
 */
export function send(options) {
  return new Job(Jobs, "sendEmail", options)
    .retry({
      retries: 5,
      wait: 3 * 60000
    }).save();
}


/**
 * Reaction.Email.getTemplate() - Returns a template source for SSR consumption
 * layout must be defined + template
 * @param {String} template name of the template in either Layouts or fs
 * @returns {Object} returns source
 */
export function getTemplate(template) {
  if (typeof template !== "string") {
    const msg = "Reaction.Email.getTemplate() requires a template name";
    Logger.error(msg);
    throw new Meteor.Error("no-template-name", msg);
  }

  // set default
  let language = "en";

  const shopLocale = Meteor.call("shop/getLocale");

  // set the language if found
  if (shopLocale && shopLocale.locale && shopLocale.locale.languages) {
    language = shopLocale.locale.languages;
  }

  // check database for a matching template
  const tmpl = Templates.findOne({ template, language });

  // use that template if found
  if (tmpl && tmpl.source) {
    return tmpl.source;
  }

  // otherwise, use the default template from the filesystem
  const file = `email/templates/${template}.html`;

  try {
    return Assets.getText(file);
  } catch (e) {
    Logger.warn(`Template not found: ${file}. Falling back to coreDefault.html`);
    return Assets.getText("email/templates/coreDefault.html");
  }
}
