import ReactionError from "@reactioncommerce/reaction-error";
import { Job, Jobs } from "/imports/utils/jobs";

/**
 * @name sitemap/generateSitemaps
 * @memberof Mutations/Sitemap
 * @method
 * @summary Regenerates sitemap files for primary shop
 * @param {Object} context - GraphQL execution context
 * @return {Undefined} triggers sitemap generation job
 */
export default async function generateSitemaps(context) {
  const { shopId, userHasPermission, userId } = context;

  if (userHasPermission(["admin"], shopId) === false) {
    throw new ReactionError("access-denied", "User does not have permissions to generate sitemaps");
  }

  new Job(Jobs, "sitemaps/generate", { notifyUserId: userId }).save({ cancelRepeats: true });
}
