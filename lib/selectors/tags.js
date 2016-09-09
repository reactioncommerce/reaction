export const getTagIds = (state) => {
  return Array.isArray(state.tags) && state.tags.map(tag => tag._id);
}
