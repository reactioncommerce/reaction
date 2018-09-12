import { getConnectionTypeResolvers } from "@reactioncommerce/reaction-graphql-utils";
import Address from "./Address";
import Currency from "./Currency";
import Money from "./Money";

export default {
  Address,
  Currency,
  Money,
  ...getConnectionTypeResolvers("Address")
};
