const { GraphQLServer } = require("graphql-yoga");

const typeDefs = `
  type Query {
    hello(name: String): String!
  }
`;

const resolvers = {
  Query: {
    hello: (_, { name }) => `Hello ${name || "World"}`
  }
};

export const server = new GraphQLServer({ typeDefs, resolvers });
