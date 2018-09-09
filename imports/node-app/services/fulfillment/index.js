import configurePlugins from "./configurePlugins";
import { graphqlResolvers, graphqlSchemas, startup, ReactionFulfillmentService } from "./core";

const service = new ReactionFulfillmentService({ graphqlResolvers, graphqlSchemas, startup });
configurePlugins(service);
service.start();

export default service;
