import { GET_PRIMARY_SHOP_ID, GET_TAGS } from "./graphqlQueries";

/**
 * @summary Queries for tags the match the provided user query
 * @param {Object} client The Apollo client
 * @param {String} query Query provided by the user
 * @returns {Array} An array of options formatted for use with react-select
 */
export async function getTags(client, query) {
  const { data: shopData } = await client.query({
    query: GET_PRIMARY_SHOP_ID
  });
  const { primaryShopId } = shopData;

  const { data, error } = await client.query({
    query: GET_TAGS,
    variables: {
      shopId: primaryShopId,
      filter: query
    }
  });

  let options = [];
  if (!error && data) {
    options = data.tags.edges.map(({ node }) => ({
      label: node.name,
      value: node._id
    }));
  }

  return options;
}

