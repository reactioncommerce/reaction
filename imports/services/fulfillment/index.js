import graphqlSchema from "./core/schema.graphql";
import graphqlResolvers from "./core/resolvers";
import ReactionService from "./ReactionService";
import configurePlugins from "./configurePlugins";
import startup from "./core/startup";

const app = new ReactionService({
  graphqlResolvers,
  graphqlSchemas: [graphqlSchema]
});
configurePlugins(app);
app.start();

startup();

export default app;
