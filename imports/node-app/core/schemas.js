import core from "/imports/plugins/core/graphql/server/no-meteor/schemas";
import fulfillmentService from "/imports/node-app/services/fulfillment";

export default [
  ...core,
  ...fulfillmentService.graphqlSchemas
];
