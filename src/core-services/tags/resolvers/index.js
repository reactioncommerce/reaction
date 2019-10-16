import getConnectionTypeResolvers from "@reactioncommerce/api-utils/graphql/getConnectionTypeResolvers.js";
import Mutation from "./Mutation/index.js";
import Query from "./Query/index.js";
import Shop from "./Shop/index.js";
import Tag from "./Tag/index.js";

export default {
  Mutation,
  Query,
  Shop,
  Tag,
  ...getConnectionTypeResolvers("Tag"),
  ...getConnectionTypeResolvers("TagProduct")
};
