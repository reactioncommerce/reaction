import { getConnectionTypeResolvers } from "@reactioncommerce/reaction-graphql-utils";
import Mutation from "./Mutation";
import Query from "./Query";

export default {
  Mutation,
  Query,
  ...getConnectionTypeResolvers("TagProduct")
};
