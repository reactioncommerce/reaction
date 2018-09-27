import SimpleSchema from "simpl-schema";
import Random from "@reactioncommerce/random";
import ReactionError from "@reactioncommerce/reaction-error";
import { NavigationItem as NavigationItemSchema } from "/imports/collections/schemas";

/**
 * @method createNavigationItem
 * @summary Creates a nav item
 * @param {Object} context - an object containing the per-request state
 * @param {Object} navigationItem - Nav item to add. See schema.graphql
 * @return {Promise<Object>} Object with `navigationItem` property containing the created nav item
 */
export default async function createNavigationItem(context, navigationItem) {
  const { collections } = context;
  const { NavigationItems } = collections;
  const { metadata } = navigationItem;

  // TODO check role/permission

  let parsedMetadata = {};
  if (metadata) {
    try {
      parsedMetadata = JSON.parse(metadata);
    } catch(error) {
      throw new ReactionError("invalid-metadata-string", "Supplied metadata JSON string could not be parsed");
    }
  }

  const newNavigationItem = {
    ...navigationItem,
    _id: Random.id(),
    metadata: parsedMetadata
  };

  NavigationItemSchema.validate(newNavigationItem);
  await NavigationItems.insert(newNavigationItem);

  return newNavigationItem;
}
