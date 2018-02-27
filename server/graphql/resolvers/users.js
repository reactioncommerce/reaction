import { Meteor } from "meteor/meteor";

export const resolvers = {
  Query: {
    getUserId: (_, { name }, context) => {
      if (context && context.user && context.user._id) {
        return context.user._id;
      }
    }
  }
};
