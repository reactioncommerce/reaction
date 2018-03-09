import { Meteor } from "meteor/meteor";
import { Job } from "/imports/plugins/core/job-collection/lib";
import { Jobs, Templates } from "/lib/collections";
import { Reaction, Logger } from "/server/api";
import { Media } from "/imports/plugins/core/files/server";

/**
 * @file `Reaction.Email` methods for creating e-mail jobs, fetching e-mail templates and e-mail subject lines
 *
 * @see https://github.com/reactioncommerce/reaction/pull/1282
 * @namespace Email
 */

/**
 * @method send
 * @memberof Email
 * @summary Add send e-mail job to job queue.
 * The worker will then process it immediately (in batches of up to 10) and will retry failures up to 5 times
 * (waiting 3 mins between each try) before failing completely.
 * All email sending attempts are logged in the job collection.
 * @see (Job API doc) https://github.com/vsivsi/meteor-job-collection/#user-content-job-api
 * @example Reaction.Email.send({
    from: 'me@example.com',
    to: 'you@example.com',
    subject: 'RE: new email API',
    html: SSR.render('some-name', { shopUrl: Meteor.absoluteUrl() })
  });
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
 * @method getSubject
 * @memberof Email
 * @summary Returns a subject source for SSR consumption
 * layout must be defined + template
 * @example SSR.compileTemplate(subject, Reaction.Email.getSubject(tpl));
 * @param {String} template name of the template in either Layouts or fs
 * @returns {Object} returns source
 */
export function getSubject(template) {
  if (typeof template !== "string") {
    const msg = "Reaction.Email.getSubject() requires a template name";
    Logger.error(msg);
    throw new Meteor.Error("invalid-parameter", msg);
  }

  // set default
  const language = Reaction.getShopLanguage();

  // check database for a matching template
  const tmpl = Templates.findOne({
    name: template,
    language
  });

  // use that template if found
  if (tmpl && tmpl.template) {
    return tmpl.subject;
  }
  return "A message from {{shop.name}}";
}

/**
 * @method getTemplate
 * @memberof Email
 * @summary Returns a template source for SSR consumption. layout must be defined + template
 * @example Reaction.Email.getTemplate('path/of/template');
 * @param {String} template name of the template in either Layouts or fs
 * @returns {Object} returns source
 */
export function getTemplate(template) {
  if (typeof template !== "string") {
    const msg = "Reaction.Email.getTemplate() requires a template name";
    Logger.error(msg);
    throw new Meteor.Error("invalid-parameter", msg);
  }

  // set default
  const language = Reaction.getShopLanguage();

  // check database for a matching template
  const tmpl = Templates.findOne({
    name: template,
    language
  });

  // use that template if found
  if (tmpl && tmpl.template) {
    return tmpl.template;
  }

  // otherwise, use the default template from the filesystem
  return getTemplateFile(template);
}

/**
 * @method getTemplateFile
 * @memberof Email
 * @param  {String} file name of the template on file system
 * @return {String} returns source
 */
export function getTemplateFile(file) {
  if (typeof file !== "string") {
    const msg = "Reaction.Email.getTemplateFile() requires a template name";
    Logger.error(msg);
    throw new Meteor.Error("invalid-parameter", msg);
  }

  try {
    return Assets.getText(`email/templates/${file}.html`);
  } catch (e) {
    Logger.warn(`Template not found: ${file}. Falling back to coreDefault.html`);
    return Assets.getText("email/templates/coreDefault.html");
  }
}


/**
 * @method getShopLogo
 * @summary Get absolute URL for shop logo, if available. If not, use default logo URL.
 * @memberof Email
 * @param  {Object} shop - shop
 * @return {String} Absolute image URL
 */
export function getShopLogo(shop) {
  let emailLogo;
  if (Array.isArray(shop.brandAssets)) {
    const brandAsset = shop.brandAssets.find((asset) => asset.type === "navbarBrandImage");
    const fileRecord = brandAsset && Promise.await(Media.findOne(brandAsset.mediaId));
    emailLogo = fileRecord && fileRecord.url({ absolute: true, store: "medium" });
  }
  return emailLogo || `${Meteor.absoluteUrl()}resources/email-templates/shop-logo.png`;
}
