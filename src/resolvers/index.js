import getConnectionTypeResolvers from "@reactioncommerce/api-utils/graphql/getConnectionTypeResolvers.js";
import Query from "./Query/index.js";
import Mutation from "./Mutation/index.js";
import Template from "./Template/index.js";

export default {
  ...getConnectionTypeResolvers(Template),
  Query,
  Mutation,
  Template
};
