import Logger from "@reactioncommerce/logger";
import { Templates } from "/lib/collections";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import ReactionError from "@reactioncommerce/reaction-error";
import getTemplateFile from "./getTemplateFile";

/**
 * @method getTemplate
 * @memberof Email
 * @summary Returns a template source for SSR consumption. layout must be defined + template
 * @example Reaction.Email.getTemplate('path/of/template');
 * @param {String} template name of the template in either Layouts or fs
 * @param {String} [language] i18n language of a template
 * @returns {Object} returns source
 */
export default function getTemplate(template, language) {
  if (typeof template !== "string") {
    const msg = "Reaction.Email.getTemplate() requires a template name";
    Logger.error(msg);
    throw new ReactionError("invalid-parameter", msg);
  }

  if (language !== undefined && typeof language !== "string") {
    const msg = "Reaction.Email.getTemplate() requires optional language code that is a string";
    Logger.error(msg);
    throw new ReactionError("invalid-parameter", msg);
  }

  if (language !== undefined) {
    // check database for a matching template using language param
    const tmpl = Templates.findOne({
      enabled: true,
      name: template,
      language
    });

    // use that template if found
    if (tmpl && tmpl.template) {
      return tmpl.template;
    }
  }

  // check database for a matching template using shop language
  const tmpl = Templates.findOne({
    name: template,
    language: Reaction.getShopLanguage()
  });

  // use that template if found
  if (tmpl && tmpl.template) {
    return tmpl.template;
  }

  // otherwise, use the default template from the filesystem
  return getTemplateFile(template);
}
