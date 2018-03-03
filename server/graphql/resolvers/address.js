import { Meteor } from "meteor/meteor";
import { applyWithContext } from "../meteor-method-context";

export const resolvers = {
  Mutation: {
    addressBookAdd: (_, { address, accountUserId, type }, context) =>
      applyWithContext(context, "accounts/addressBookAdd", [address, accountUserId, type])
  }
};
