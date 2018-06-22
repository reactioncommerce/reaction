import Logger from "@reactioncommerce/logger";
import { Meteor } from "meteor/meteor";
import { Templates } from "/lib/collections";
import Reaction from "/server/api/core";
import getTemplateFile from "./getTemplateFile";

/**
 * @method getTemplate
 * @memberof Email
 * @summary Returns a template source for SSR consumption. layout must be defined + template
 * @example Reaction.Email.getTemplate('path/of/template');
 * @param {String} template name of the template in either Layouts or fs
 * @returns {Object} returns source
 */
export default function getTemplate(template) {
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
