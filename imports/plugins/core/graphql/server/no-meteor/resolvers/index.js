import { merge } from "lodash";
import fulfillmentService from "/imports/plugins/core/core/server/no-meteor/services/fulfillment";

export default merge({}, fulfillmentService.graphqlResolvers);
