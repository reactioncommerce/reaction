import applyBeforeAfterToFilter from "./applyBeforeAfterToFilter";

/**
 * @name checkHasMoreInOppositeDirection
 * @method
 * @summary Checks whether there are more documents before an "after" doc or after a "before" doc
 * @param {Object} args
 * @returns {Boolean} Are there more? Always returns `false` if both `before` and `after` are falsy
 */
export default async function checkHasMoreInOppositeDirection({
  after,
  baseFilter,
  before,
  mongoCursor,
  sort,
  sortBy,
  sortOrder
}) {
  let moreItems = [];

  // For forward pagination, this is the best place to query and find out if there is at least one
  // document immediately before the "after" document.
  if (after) {
    const previousFilter = applyBeforeAfterToFilter({
      baseFilter,
      before: after, // We're swapping these to determine if there's a previous page
      sortBy,
      sortOrder
    });

    moreItems = await mongoCursor
      .clone()
      .filter(previousFilter)
      .sort(sort)
      .limit(1)
      .toArray();
  }

  // For backward pagination, this is the best place to query and find out if there is at least one
  // document immediately after the "before" document.
  if (before) {
    const nextFilter = applyBeforeAfterToFilter({
      baseFilter,
      after: before, // We're swapping these to determine if there's a next page
      sortBy,
      sortOrder
    });

    moreItems = await mongoCursor
      .clone()
      .filter(nextFilter)
      .sort(sort)
      .limit(1)
      .toArray();
  }

  return (moreItems.length) === 1;
}
