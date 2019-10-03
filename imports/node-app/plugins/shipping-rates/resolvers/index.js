import { getConnectionTypeResolvers } from "@reactioncommerce/reaction-graphql-utils";
import FlatRateFulfillmentRestriction from "./FlatRateFulfillmentRestriction/index.js";
import Mutation from "./Mutation/index.js";
import Query from "./Query/index.js";

export default {
  ...getConnectionTypeResolvers("FlatRateFulfillmentRestriction"),
  FlatRateFulfillmentRestriction,
  Mutation,
  Query
};
