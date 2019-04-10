import templateDefinitions from "../templates";
import seedEmailTemplate from "./seedEmailTemplate";

/**
 * @param {Object} context App context
 * @return {undefined}
 */
export default async function seedEmailTemplates(context) {
  const { Shops } = context.collections;
  const shops = await Shops.find({}, { projection: { _id: 1 } }).toArray();

  const promises = [];

  shops.forEach((shop) => {
    const shopPromises = templateDefinitions.map((templateDefinition) => (
      seedEmailTemplate(context, shop._id, templateDefinition)
    ));
    promises.push(...shopPromises);
  });

  await Promise.all(promises);
}
