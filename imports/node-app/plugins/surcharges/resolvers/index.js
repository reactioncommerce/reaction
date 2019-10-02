import { getConnectionTypeResolvers } from "@reactioncommerce/reaction-graphql-utils";
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
