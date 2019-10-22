import Random from "@reactioncommerce/random";
import ReactionError from "@reactioncommerce/reaction-error";
import { NavigationItem as NavigationItemSchema } from "../simpleSchemas.js";

/**
 * @method createNavigationItem
 * @summary Creates a nav item
 * @param {Object} context An object containing the per-request state
 * @param {Object} input An object of all mutation arguments that were sent by the client
 * @param {String} input.navigationItem Nav item to add. See schema.graphql
 * @param {String} input.shopId ID of the shop navigation item belongs
 * @returns {Promise<Object>} The created navigation item
 */
export default async function createNavigationItem(context, input) {
  const { checkPermissions, collections } = context;
  const { NavigationItems } = collections;
  const { navigationItem, shopId } = input;

  const { metadata, draftData = {} } = navigationItem;

  if (!context.isInternalCall) {
    await checkPermissions(["core"], shopId);
  }

  let parsedMetadata = {};
  if (metadata) {
    try {
      parsedMetadata = JSON.parse(metadata);
    } catch (error) {
      throw new ReactionError("invalid-metadata-string", "Supplied metadata JSON string could not be parsed");
    }
  }

  const newNavigationItem = {
    ...navigationItem,
    _id: Random.id(),
    shopId,
    draftData,
    data: {},
    metadata: parsedMetadata,
    createdAt: new Date(),
    hasUnpublishedChanges: true
  };

  NavigationItemSchema.validate(newNavigationItem);
  await NavigationItems.insertOne(newNavigationItem);

  return newNavigationItem;
}
