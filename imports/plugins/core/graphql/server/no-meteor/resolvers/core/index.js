import { getConnectionTypeResolvers } from "@reactioncommerce/reaction-graphql-utils";
import Address from "./Address";
import Currency from "./Currency";

export default {
  Address,
  Currency,
  ...getConnectionTypeResolvers("Address")
};
