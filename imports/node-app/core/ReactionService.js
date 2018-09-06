import { merge } from "lodash";

export default class ReactionService {
  constructor({
    graphqlResolvers,
    graphqlSchemas,
    startup
  } = {}) {
    this.graphqlResolvers = {};
    this.graphqlSchemas = [];

    this.addGraphqlResolvers(graphqlResolvers);
    this.addGraphqlSchemas(graphqlSchemas);

    this.startup = typeof startup === "function" ? startup : () => {};
  }

  addGraphqlResolvers(resolvers) {
    merge(this.graphqlResolvers, resolvers);
  }

  addGraphqlSchemas(schemas) {
    this.graphqlSchemas.push(...schemas);
  }

  start() {
    // In the future this would start the Express app serving
  }
}
