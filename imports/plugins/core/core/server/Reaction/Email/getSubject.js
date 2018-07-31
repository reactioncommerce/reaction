import Logger from "@reactioncommerce/logger";
import { Templates } from "/lib/collections";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import ReactionError from "/imports/plugins/core/graphql/server/no-meteor/ReactionError";

/**
 * @method getSubject
 * @memberof Email
 * @summary Returns a subject source for SSR consumption
 * layout must be defined + template
 * @example SSR.compileTemplate(subject, Reaction.Email.getSubject(tpl));
 * @param {String} template name of the template in either Layouts or fs
 * @returns {Object} returns source
 */
export default function getSubject(template) {
  if (typeof template !== "string") {
    const msg = "Reaction.Email.getSubject() requires a template name";
    Logger.error(msg);
    throw new ReactionError("invalid-parameter", msg);
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
