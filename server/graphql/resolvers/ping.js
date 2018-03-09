export default {
  Query: {
    ping: () => "pong"
  },
  Mutation: {
    echo: (_, { str }) => `${str}`
  }
};
