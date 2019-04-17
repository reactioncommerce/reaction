/**
 * @summary Returns a template source for SSR consumption
 * @param {Object} context App context
 * @param {String} shopId Shop ID
 * @param {String} templateName Email template name
 * @returns {Object} returns source
 */
export default async function getTemplateConfig(context, shopId, templateName) {
  const { Shops, Templates } = context.collections;

  const shop = await Shops.findOne({
    _id: shopId
  }, {
    projection: {
      language: 1
    }
  });
  if (!shop) throw new Error(`Shop with ID ${shopId} not found`);

  const { language } = shop;

  // check database for a matching template
  const templateDoc = await Templates.findOne({
    language,
    name: templateName,
    shopId,
    type: "email"
  });
  if (!templateDoc) throw new Error(`No email template found for language ${language}`);

  return templateDoc;
}
