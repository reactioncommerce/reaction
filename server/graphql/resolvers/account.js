import { Logger } from "/server/api";
import { Meteor } from "meteor/meteor";
import { applyWithContext } from "../meteor-method-context";

export const resolvers = {
  Mutation: {
    addAccountAddressBookEntry: (_, { accountId, input }, context) =>
      applyWithContext(context, "accounts/addressBookAdd", [input, accountId]),

    updateAccountAddressBookEntry: (_, { accountId, addressId, modifier }, context) => {
      const { type, ...address } = modifier;
      address._id = addressId;
      return applyWithContext(context, "accounts/addressBookAdd", [address, accountId, type]);
    }
  },

  Query: {
    getUserId: (_, { name }, context) => {
      if (context && context.user && context.user._id) {
        return context.user._id;
      }
    }
  }
};
