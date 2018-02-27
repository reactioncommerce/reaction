export const resolvers = {
  Query: {
    ping: () => "pong"
  },
  Mutation: {
    echo: (_, { str }) => `${str}`
  }
};
