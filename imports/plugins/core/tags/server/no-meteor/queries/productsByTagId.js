import { arrayJoinQuery, getPaginatedResponse } from "@reactioncommerce/reaction-graphql-utils";
import ReactionError from "@reactioncommerce/reaction-error";

const DEFAULT_LIMIT = 20;

/**
 * @name queries.productsByTagId
 * @method
 * @memberof Tags/GraphQL
 * @summary get a list of products by tag id
 * @param {Object} context - an object containing the per-request state
 * @param {Object} [params] - an object of all arguments that were sent by the client
 * @param {String} [params.shopId] - Shop ID
 * @param {String} [params.tagId] - Tag ID
 * @return {Promise<Array<Object>>} array of TagProducts
 */
export default async function productsByTagId(context, params) {
  const { connectionArgs, shopId, tagId } = params;
  const { collections, userHasPermission } = context;
  const { Products, Tags } = collections;

  // Check for owner or admin permissions from the user before allowing the query
  if (!userHasPermission(["owner", "admin"], shopId)) {
    throw new ReactionError("access-denied", "User does not have permission");
  }

  const tag = await Tags.findOne({
    _id: tagId
  }, {
    projection: {
      featuredProductIds: 1
    }
  });

  if (!tag) {
    throw new ReactionError("not-found", "Tag not found");
  }

  const {
    after,
    before,
    first,
    last
  } = connectionArgs;

  if (first && last) throw new Error("Request either `first` or `last` but not both");

  // Enforce a `first: 20` limit if no user-supplied limit, using the DEFAULT_LIMIT
  const limit = first || last || DEFAULT_LIMIT;

  const isForwardPagination = !last;
  let hasNextPage = false;
  let hasPreviousPage = false;

  const cursor = Products.find({ hashtags: tagId, shopId });

  // First get the list of products explicitly given a featured sort position.
  const featuredCount = (tag.featuredProductIds || []).length;
  if (featuredCount) {
    const totalCount = cursor.clone().count();

    // We can save ourselves some DB work when there are none
    if (!totalCount) {
      return {
        nodes: [],
        pageInfo: {
          hasPreviousPage,
          hasNextPage
        },
        totalCount
      };
    }

    let nodes;

    if (isForwardPagination) {
      const afterIndex = tag.featuredProductIds.indexOf(after);
      if (!after || afterIndex > -1) {
        nodes = await arrayJoinQuery({
          arrayFieldPath: "featuredProductIds",
          collection: Tags,
          connectionArgs: {
            after,
            first: limit,
            sortOrder: "asc"
          },
          positionFieldName: "position",
          joinCollectionName: "Products",
          selector: { _id: tagId }
        });
      } else {
        nodes = [];
      }

      // If we found fewer than requested and are forward paginating,
      // do a normal Products query for the rest
      if (nodes.length < limit) {
        const nonFeaturedProductsCursor = Products.find({
          _id: { $nin: tag.featuredProductIds },
          hashtags: tagId,
          shopId
        });

        const result = await getPaginatedResponse(nonFeaturedProductsCursor, {
          after,
          first: limit - nodes.length,
          sortBy: "createdAt",
          sortOrder: "asc"
        });

        nodes.push(...result.nodes);

        ({ hasNextPage } = result.pageInfo);
        hasPreviousPage = !!(after && afterIndex !== 0);
      } else {
        hasNextPage = !!(totalCount > limit);
        hasPreviousPage = !!(after && afterIndex !== 0);
      }
    } else {
      // Backwards pagination
      const beforeIndex = tag.featuredProductIds.indexOf(before);
      if (beforeIndex > -1) {
        nodes = await arrayJoinQuery({
          arrayFieldPath: "featuredProductIds",
          collection: Tags,
          connectionArgs: {
            before,
            last: limit,
            sortOrder: "asc"
          },
          positionFieldName: "position",
          joinCollectionName: "Products",
          selector: { _id: tagId }
        });
      } else {
        nodes = [];
      }

      if (nodes.length < limit) {
        const nonFeaturedProductsCursor = Products.find({
          _id: { $nin: tag.featuredProductIds },
          hashtags: tagId,
          shopId
        });

        const result = await getPaginatedResponse(nonFeaturedProductsCursor, {
          before,
          last: limit - nodes.length,
          sortBy: "createdAt",
          sortOrder: "asc"
        });

        nodes.push(...result.nodes);

        ({ hasNextPage } = result.pageInfo);
        hasPreviousPage = result.pageInfo.hasPreviousPage || hasPreviousPage;

        // We have to do this again after we know how many we got back,
        // if we didn't get enough back.
        if (beforeIndex === -1 && nodes.length < limit) {
          const featuredNodes = await arrayJoinQuery({
            arrayFieldPath: "featuredProductIds",
            collection: Tags,
            connectionArgs: {
              last: limit - nodes.length,
              sortOrder: "asc"
            },
            positionFieldName: "position",
            joinCollectionName: "Products",
            selector: { _id: tagId }
          });

          nodes = featuredNodes.concat(nodes);
        }
      } else {
        hasPreviousPage = !!(before && beforeIndex !== 0);
        hasNextPage = (before && beforeIndex < featuredCount - 1);
      }
    }

    const pageInfo = {
      hasPreviousPage,
      hasNextPage
    };

    const count = nodes.length;
    if (count) {
      pageInfo.startCursor = nodes[0]._id;
      pageInfo.endCursor = nodes[count - 1]._id;
    }

    return { nodes, pageInfo, totalCount };
  }

  // If there are no featured products
  return getPaginatedResponse(cursor, {
    ...connectionArgs,
    sortBy: "createdAt",
    sortOrder: "asc"
  });
}
