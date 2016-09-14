export const getTagIds = (state) => {
  if (Array.isArray(state.tags)) {
    return state.tags.map(tag => tag._id);
  }

  return [];
};
