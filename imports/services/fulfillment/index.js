import configurePlugins from "./configurePlugins";
import { graphqlResolvers, graphqlSchemas, ReactionFulfillmentService } from "./core";

const app = new ReactionFulfillmentService({ graphqlResolvers, graphqlSchemas });
configurePlugins(app);
app.start();

export default app;

export { startup } from "./core";
