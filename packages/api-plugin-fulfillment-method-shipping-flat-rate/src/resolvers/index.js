import getConnectionTypeResolvers from "@reactioncommerce/api-utils/graphql/getConnectionTypeResolvers.js";
import FlatRateFulfillmentMethod from "./FlatRateFulfillmentMethod/index.js";
import FlatRateFulfillmentRestriction from "./FlatRateFulfillmentRestriction/index.js";
import Mutation from "./Mutation/index.js";
import Query from "./Query/index.js";
import ShopSettings from "./ShopSettings/index.js";

export default {
  ...getConnectionTypeResolvers("FlatRateFulfillmentRestriction"),
  ...getConnectionTypeResolvers("FlatRateFulfillmentMethod"),
  FlatRateFulfillmentMethod,
  FlatRateFulfillmentRestriction,
  Mutation,
  Query,
  ShopSettings
};
