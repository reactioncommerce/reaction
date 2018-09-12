import graphqlSchema from "./schema.graphql";
import graphqlResolvers from "./resolvers";
import ReactionFulfillmentService from "./ReactionFulfillmentService";
import startup from "./startup";

const service = new ReactionFulfillmentService({
  graphqlResolvers,
  graphqlSchemas: [graphqlSchema],
  startup
});
service.start();

export default service;
