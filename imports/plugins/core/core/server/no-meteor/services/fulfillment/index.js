import graphqlSchema from "./schema.graphql";
import graphqlResolvers from "./resolvers";
import ReactionFulfillmentService from "./ReactionFulfillmentService";
import mutations from "./mutations";
import startup from "./startup";

const service = new ReactionFulfillmentService({
  graphqlResolvers,
  graphqlSchemas: [graphqlSchema],
  mutations,
  startup
});
service.start();

export default service;
