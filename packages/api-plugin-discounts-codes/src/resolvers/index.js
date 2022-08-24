import getConnectionTypeResolvers from "@reactioncommerce/api-utils/graphql/getConnectionTypeResolvers.js";
import Mutation from "./Mutation/index.js";
import Query from "./Query/index.js";
import DiscountCode from "./DiscountCode/index.js";

export default {
  DiscountCode,
  Mutation,
  Query,
  ...getConnectionTypeResolvers("DiscountCode")
};
