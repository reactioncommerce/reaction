import { getConnectionTypeResolvers } from "@reactioncommerce/reaction-graphql-utils";
import NavigationItem from "./NavigationItem";
import NavigationTree from "./NavigationTree";
import ShopSettings from "./ShopSettings";
import Mutation from "./Mutation";
import Query from "./Query";

export default {
  NavigationItem,
  ...getConnectionTypeResolvers("NavigationItem"),
  NavigationTree,
  Mutation,
  Query,
  ShopSettings
};
