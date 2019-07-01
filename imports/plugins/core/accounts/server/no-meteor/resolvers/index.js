import { getConnectionTypeResolvers } from "@reactioncommerce/reaction-graphql-utils";
import Account from "./Account";
import AddAccountAddressBookEntryPayload from "./AddAccountAddressBookEntryPayload";
import Group from "./Group";
import Mutation from "./Mutation";
import Query from "./Query";
import Shop from "./Shop";

/**
 * Account-related GraphQL resolvers
 * @namespace Accounts/GraphQL
 */

export default {
  Account,
  AddAccountAddressBookEntryPayload,
  Group,
  Mutation,
  Query,
  Shop,
  ...getConnectionTypeResolvers("Account"),
  ...getConnectionTypeResolvers("Group"),
  ...getConnectionTypeResolvers("Role")
};
