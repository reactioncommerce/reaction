import { getConnectionTypeResolvers } from "@reactioncommerce/reaction-graphql-utils";
import FlatRateFulfillmentRestriction from "./FlatRateFulfillmentRestriction";
import Mutation from "./Mutation";
import Query from "./Query";

export default {
  ...getConnectionTypeResolvers("FlatRateFulfillmentRestriction"),
  FlatRateFulfillmentRestriction,
  Mutation,
  Query
};
