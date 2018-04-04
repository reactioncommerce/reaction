import createApolloServer from "../../imports/plugins/core/graphql/server/createApolloServer";
import methods from "./methods";
import queries from "./queries";

const PORT = 3030;

/**
 * This is a server for development of the GraphQL API without needing
 * to run Meteor. After finishing development, you should still test
 * the API changes through the Meteor app in case there are any differences.
 */
const app = createApolloServer({
  context: {
    methods,
    queries
  },
  debug: true,
  getUserFromToken: () => ({ _id: "123", name: "Fake Person" }),
  graphiql: true
});

app.listen(PORT, () => {
  console.info(`GraphQL listening at http://localhost:${PORT}/graphql-alpha`);
  console.info(`GraphiQL UI: http://localhost:${PORT}/graphiql`);
});
