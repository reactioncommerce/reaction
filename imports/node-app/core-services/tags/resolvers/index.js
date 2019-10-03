import { getConnectionTypeResolvers } from "@reactioncommerce/reaction-graphql-utils";
import Mutation from "./Mutation/index.js";
import Query from "./Query/index.js";

export default {
  Mutation,
  Query,
  ...getConnectionTypeResolvers("TagProduct")
};
