import SimpleSchema from "simpl-schema";
import Random from "@reactioncommerce/random";
import ReactionError from "@reactioncommerce/reaction-error";
import { NavItem as NavItemSchema } from "/imports/collections/schemas";
import { decodeNavItemMetadata } from "../xforms";

/**
 * @method createNavItem
 * @summary Creates a nav item
 * @param {Object} context - an object containing the per-request state
 * @param {Object} navItem - Nav item to add. See schema.graphql
 * @return {Promise<Object>} Object with `navItem` property containing the created nav item
 */
export default async function createNavItem(context, navItem) {
  console.log("here");
  const { collections } = context;
  const { NavItems } = collections;
  const { navItem: { metadata } } = input;

  // TODO check role/permission

  let decodedMetadata = {};
  if (decodedMetadata) {
    decodedMetadata = decodeNavItemMetadata(metadata);
  }

  const newNavItem = {
    ...navItem,
    _id: Random.id(),
    metadata: decodedMetadata
  };

  NavItemSchema.validate(newNavItem);
  await NavItems.insert(newNavItem);

  return newNavItem;
}
