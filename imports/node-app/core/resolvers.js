import { merge } from "lodash";
import core from "/imports/plugins/core/graphql/server/no-meteor/resolvers";
import fulfillmentService from "/imports/node-app/services/fulfillment";

export default merge({}, core, fulfillmentService.graphqlResolvers);
