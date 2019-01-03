/**
 * Load next page of content for a Apollo GraphQL query
 * @name loadNextPage
 * @param {Object} args Args for pagination
 * @param {String} args.queryName Name of the GraphQL whose result will be used to paginate
 * @param {Object} args.data Full result from GraphQl
 * @param {Object} args.limit Limit
 * @param {Object} args.fetchMore fetchMore function
 * @returns {Function} load next page function
 */
export const loadNextPage = ({ queryName, data, limit, fetchMore }) => () => {
  if (!queryName) throw new Error("queryName is required");

  const cursor = data[queryName].pageInfo.endCursor;

  fetchMore({
    variables: {
      first: limit,
      after: cursor,
      last: null,
      before: null
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
 * Load previous page of content for a Apollo GraphQL query
 * @name loadPreviousPage
 * @param {Object} args Args for pagination
 * @param {String} args.queryName Name of the GraphQL whose result will be used to paginate
 * @param {Object} args.data Full result from GraphQl
 * @param {Object} args.limit Limit
 * @param {Object} args.fetchMore fetchMore function
 * @returns {Function} load next page function
 */
export const loadPreviousPage = ({ queryName, data, limit, fetchMore }) => () => {
  if (!queryName) throw new Error("queryName is required");

  const cursor = data[queryName].pageInfo.startCursor;

  fetchMore({
    variables: {
      first: null,
      after: null,
      last: limit,
      before: cursor
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
 * Create pagination functions for next and previous and page info data
 * @name pagination
 * @param {Object} args Args for pagination
 * @param {String} args.queryName Name of the GraphQL whose result will be used to paginate
 * @param {Object} args.data Full result from GraphQl
 * @param {Object} args.limit Limit
 * @param {Object} args.fetchMore fetchMore function
 * @returns {Function} load next page function
 */
export const pagination = (args) => {
  const { queryName, data } = args;

  if (!queryName) throw new Error("queryName is required");

  const pageInfo = (data && data[queryName] && data[queryName].pageInfo) || {};

  return {
    ...pageInfo,
    loadNextPage: loadNextPage(args),
    loadPreviousPage: loadPreviousPage(args)
  };
};
