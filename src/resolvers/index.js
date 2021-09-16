import getConnectionTypeResolvers from "@reactioncommerce/api-utils/graphql/getConnectionTypeResolvers.js";
import Query from "./Query/index.js";
import Mutation from "./Mutation/index.js";

export default {
  Query,
  Mutation,
  ...getConnectionTypeResolvers("Template")
};
