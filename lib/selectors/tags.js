/**
 * @method getTagIds
 * @memberof Core
 * @summary Get an array of IDs of tags
 * @example getTagIds({ tags: subTagGroups })
 * @param  {Object} state object
 * @param  {Array}  state.tags Array of tags
 * @returns {Array}  Array of tag IDs
 */
export const getTagIds = (state) => {
  if (Array.isArray(state.tags)) {
    return state.tags.map((tag) => tag._id);
  }

  return [];
};
