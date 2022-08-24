import getConnectionTypeResolvers from "@reactioncommerce/api-utils/graphql/getConnectionTypeResolvers.js";
import AppliedSurcharge from "./AppliedSurcharge/index.js";
import Surcharge from "./Surcharge/index.js";
import Mutation from "./Mutation/index.js";
import Query from "./Query/index.js";

export default {
  ...getConnectionTypeResolvers("Surcharge"),
  AppliedSurcharge,
  Surcharge,
  Mutation,
  Query
};
