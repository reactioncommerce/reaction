import { getConnectionTypeResolvers } from "@reactioncommerce/reaction-graphql-utils";
import Surcharge from "./Surcharge";
import Mutation from "./Mutation";
import Query from "./Query";

export default {
  ...getConnectionTypeResolvers("Surcharge"),
  Surcharge,
  Mutation,
  Query
};
