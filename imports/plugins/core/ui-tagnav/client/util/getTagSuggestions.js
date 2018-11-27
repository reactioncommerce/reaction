import { Reaction } from "/client/api";
import { Tags } from "/lib/collections";

/**
 * @name getTagSuggestions
 * @summary Returns tags matching the given term
 * @param {String} term search query
 * @param {Object} options options
 * @param {Array} [options.excludeTags] array of tag ids (String) to exclude
 * @return {Promise<Array>} matching tags
 */
export default async function getTagSuggestions(term, { excludeTags }) {
  const slug = await Reaction.getSlug(term);

  const selector = {
    slug: new RegExp(slug, "i")
  };

  if (Array.isArray(excludeTags)) {
    selector._id = {
      $nin: excludeTags
    };
  }

  const tags = Tags.find(selector).map((tag) => ({
    label: tag.name
  }));

  return tags;
}
