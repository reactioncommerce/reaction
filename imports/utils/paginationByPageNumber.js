/**
 * Load page generator
 * @name loadPage
 * @param {Object} args Args for pagination
 * @param {String} args.queryName Name of the GraphQL whose result will be used to paginate
 * @param {Object} args.limit Limit
 * @param {Object} args.fetchMore fetchMore function
 * @returns {Function} load page function
 */
const loadPage = ({ queryName, limit, fetchMore }) => (page) => {
  if (!queryName) throw new Error("queryName is required");

  fetchMore({
    variables: {
      limit,
      page
    },
    updateQuery: (previousResult, { fetchMoreResult }) => {
      const { [queryName]: items } = fetchMoreResult;

      if (items.nodes && items.nodes.length) {
        return fetchMoreResult;
      }

      // Send the previous result if the new result contains no additional data
      return previousResult;
    }
  });
};

/**
 * Pagination helpers including pageInfo, totalCount and a loadPage function
 * @name pagination
 * @param {Object} args Args for pagination
 * @param {String} args.queryName Name of the GraphQL whose result will be used to paginate
 * @param {Object} args.data Full result from GraphQl
 * @param {Object} args.limit Limit
 * @param {Object} args.fetchMore fetchMore function
 * @returns {Function} load page function
 */
export default function paginationByPageNumber(args) {
  const { queryName, data } = args;

  if (!queryName) throw new Error("queryName is required");

  const pageInfo = (data && data[queryName] && data[queryName].pageInfo) || {};
  const totalCount = (data && data[queryName] && data[queryName].totalCount) || 0;

  return {
    ...pageInfo,
    totalCount,
    loadPage: loadPage(args)
  };
}
