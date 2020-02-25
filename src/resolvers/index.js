import getConnectionTypeResolvers from "@reactioncommerce/api-utils/graphql/getConnectionTypeResolvers.js";
import Query from "./Query/index.js";
import Shop from "./Shop/index.js";

export default {
  Query,
  Shop,
  ...getConnectionTypeResolvers("Role")
};
