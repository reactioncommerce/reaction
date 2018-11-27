/**
 * Load more content for a Apollo GraphQL query
 * @name loadMore
 * @param {Object} args Args for pagination
 * @param {String} args.queryName Name of the GraphQL whose result will be used to paginate
 * @param {Object} args.pageInfo Page info from GraphQL result
 * @param {Object} args.limit Limit
 * @param {Object} args.fetchMore fetchMore function
 * @param {Function} callback Function to execute when fetchMore returns
 * @returns {Object} GraphQL result with new items appended
 */
export const loadMore = ({ queryName, pageInfo, limit, fetchMore }, callback) => {
  if (!queryName) throw new Error("queryName is required");

  const cursor = pageInfo.endCursor;

  fetchMore({
    variables: {
      first: limit,
      after: cursor,
      last: null,
      before: null
    },
    updateQuery: (previousResult, { fetchMoreResult }) => {
      const { [queryName]: items } = fetchMoreResult;

      if (callback) {
        callback();
      }

      // Return with additional results
      if (items.edges.length) {
        const edges = [
          ...previousResult[queryName].edges,
          ...fetchMoreResult[queryName].edges
        ];
        return {
          [queryName]: {
            __typename: previousResult[queryName].__typename,
            edges,
            pageInfo: fetchMoreResult[queryName].pageInfo,
            totalCount: fetchMoreResult[queryName].totalCount
          }
        };
      }

      // Send the previous result if the new result contains no additional data
      return previousResult;
    }
  });
};
