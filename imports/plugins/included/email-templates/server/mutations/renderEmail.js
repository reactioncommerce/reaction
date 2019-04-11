import Handlebars from "handlebars";
import getTemplateConfig from "../util/getTemplateConfig";

/**
 * @summary Renders an email given some name and data.
 *   The core email plugin expects that some other plugin (this one by default)
 *   will add a `renderEmail` function to the `mutations` object.
 * @param {Object} context App context
 * @param {Object} [data] Data that will be used to populate placeholders in the template
 * @param {String} shopId The shop ID, to look up the email template for this shop
 * @param {String} templateName Template name
 * @return {Object} An object with rendered content in properties `html` and `subject`
 */
export default async function renderEmail(context, { data, shopId, templateName }) {
  const { template, subject } = await getTemplateConfig(context, shopId, templateName);

  const renderSubject = Handlebars.compile(subject);
  const renderBody = Handlebars.compile(template);

  return {
    subject: renderSubject(data),
    html: renderBody(data)
  };
}
