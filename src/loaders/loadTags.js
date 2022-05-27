import TagsData from "../json-data/Tags.json";

/**
 * @summary loads Tag data
 * @param {Object} context - The application context
 * @param {String} shopId - The shop id
 * @returns {Object} Object with details of the tags created
 */
export default async function loadTags(context, shopId) {

  Object.keys(TagsData).forEach((tagItem) => {
    TagsData[tagItem].shopId = shopId;
  });

  // Hardcoded Sample Tags
  // Two sections (Men/Women) each with two slugs
  const tagOutput = {}
  tagOutput.men = await context.mutations.addTag(context.getInternalContext(), TagsData.men);
  tagOutput.menOutdoor = await context.mutations.addTag(context.getInternalContext(), TagsData.menOutdoor);
  tagOutput.menJacket = await context.mutations.addTag(context.getInternalContext(), TagsData.menJacket);
  tagOutput.women = await context.mutations.addTag(context.getInternalContext(), TagsData.women);
  tagOutput.womenOutdoor = await context.mutations.addTag(context.getInternalContext(), TagsData.womenOutdoor);
  tagOutput.womenJacket = await context.mutations.addTag(context.getInternalContext(), TagsData.womenJacket);

  return tagOutput;
}
