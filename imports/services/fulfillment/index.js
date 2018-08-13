import graphqlSchema from "./schema.graphql";
import graphqlResolvers from "./resolvers";

// Plugins
import { getShippingPrices } from "./plugins/flat-rate";

export const graphqlSchemas = [graphqlSchema];

export const getShippingPricesFunctions = [getShippingPrices];

export { default as startup } from "./startup";

export { graphqlResolvers };
