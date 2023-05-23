import TagsData from "../json-data/Tags.json" assert { type: "json" };

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
  // Three sections (Men/Women/Unisex) each with two slugs except Unisex
  const tagOutput = {};
  tagOutput.men = await context.mutations.addTag(context.getInternalContext(), TagsData.men);
  tagOutput.menOutdoor = await context.mutations.addTag(context.getInternalContext(), TagsData.menOutdoor);
  tagOutput.menJacket = await context.mutations.addTag(context.getInternalContext(), TagsData.menJacket);
  tagOutput.women = await context.mutations.addTag(context.getInternalContext(), TagsData.women);
  tagOutput.womenOutdoor = await context.mutations.addTag(context.getInternalContext(), TagsData.womenOutdoor);
  tagOutput.womenJacket = await context.mutations.addTag(context.getInternalContext(), TagsData.womenJacket);
  tagOutput.unisex = await context.mutations.addTag(context.getInternalContext(), TagsData.unisex);
  tagOutput.unisexOutdoor = await context.mutations.addTag(context.getInternalContext(), TagsData.unisexOutdoor);

  return tagOutput;
}
