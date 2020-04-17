import getConnectionTypeResolvers from "@reactioncommerce/api-utils/graphql/getConnectionTypeResolvers.js";
import ProductConfiguration from "./ProductConfiguration.js";
import Mutation from "./Mutation/index.js";
import Query from "./Query/index.js";
import Product from "./Product/index.js";
import ProductVariant from "./ProductVariant/index.js";

export default {
  ProductConfiguration,
  Mutation,
  Query,
  Product,
  ProductVariant,
  ...getConnectionTypeResolvers("Product")
};
