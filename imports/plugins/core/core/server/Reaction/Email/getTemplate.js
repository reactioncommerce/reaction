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
 * @param {String} [language=Reaction.getShopLanguage()] language of a template
 * @returns {Object} returns source
 */
export default function getTemplate(template, language = Reaction.getShopLanguage()) {
  if (typeof template !== "string") {
    const msg = "Reaction.Email.getTemplate() requires a template name";
    Logger.error(msg);
    throw new ReactionError("invalid-parameter", msg);
  }

  if (typeof language !== "string") {
    const msg = "Reaction.Email.getTemplate() requires optional language code that is a string";
    Logger.error(msg);
    throw new ReactionError("invalid-parameter", msg);
  }

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
