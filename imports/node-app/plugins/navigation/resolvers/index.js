import { getConnectionTypeResolvers } from "@reactioncommerce/reaction-graphql-utils";
import NavigationItem from "./NavigationItem/index.js";
import NavigationTree from "./NavigationTree/index.js";
import ShopSettings from "./ShopSettings/index.js";
import Mutation from "./Mutation/index.js";
import Query from "./Query/index.js";

export default {
  NavigationItem,
  ...getConnectionTypeResolvers("NavigationItem"),
  NavigationTree,
  Mutation,
  Query,
  ShopSettings
};
