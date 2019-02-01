import { getConnectionTypeResolvers } from "@reactioncommerce/reaction-graphql-utils";
import AppliedSurcharge from "./AppliedSurcharge";
import Surcharge from "./Surcharge";
import Mutation from "./Mutation";
import Query from "./Query";

export default {
  ...getConnectionTypeResolvers("Surcharge"),
  AppliedSurcharge,
  Surcharge,
  Mutation,
  Query
};
