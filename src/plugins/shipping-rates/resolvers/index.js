import getConnectionTypeResolvers from "@reactioncommerce/api-utils/graphql/getConnectionTypeResolvers.js";
import FlatRateFulfillmentRestriction from "./FlatRateFulfillmentRestriction/index.js";
import Mutation from "./Mutation/index.js";
import Query from "./Query/index.js";

export default {
  ...getConnectionTypeResolvers("FlatRateFulfillmentRestriction"),
  FlatRateFulfillmentRestriction,
  Mutation,
  Query
};
