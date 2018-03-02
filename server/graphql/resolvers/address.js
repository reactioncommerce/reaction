import { Meteor } from "meteor/meteor";

export const resolvers = {
  Mutation: {
    addressBookAdd: (_, { address, accountUserId, type }, context) => {
      const userId = accountUserId || context.user._id;
      Meteor.call("accounts/addressBookAdd", address, userId, type);
    }
  }
};
