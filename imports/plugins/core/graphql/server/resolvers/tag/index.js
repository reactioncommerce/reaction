import { getConnectionTypeResolvers } from "@reactioncommerce/reaction-graphql-utils";
import Query from "./Query";
import Tag from "./Tag";

/**
 * Tag-related GraphQL resolvers
 * @namespace Tag/GraphQL
 */

export default {
  Query,
  Tag,
  ...getConnectionTypeResolvers("Tag")
};
