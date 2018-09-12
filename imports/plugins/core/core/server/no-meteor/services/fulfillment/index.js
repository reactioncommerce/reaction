import graphqlSchema from "./schema.graphql";
import ReactionFulfillmentService from "./ReactionFulfillmentService";
import startup from "./startup";

const service = new ReactionFulfillmentService({
  graphqlSchemas: [graphqlSchema],
  startup
});
service.start();

export default service;
