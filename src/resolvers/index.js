import getConnectionTypeResolvers from "@reactioncommerce/api-utils/graphql/getConnectionTypeResolvers.js";
import Mutation from "./Mutation/index.js";
import Query from "./Query/index.js";
import TaxRate from "./TaxRate/index.js";

/**
 * TaxRate-related GraphQL resolvers
 * @namespace Accounts/GraphQL
 */

export default {
  Mutation,
  Query,
  TaxRate,
  ...getConnectionTypeResolvers("TaxRate")
};
