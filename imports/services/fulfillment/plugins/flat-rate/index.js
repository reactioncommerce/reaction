import graphqlSchema from "./schema.graphql";

export const graphqlSchemas = [graphqlSchema];
export { default as graphqlResolvers } from "./resolvers";
export { default as getShippingPrices } from "./getShippingPrices";
