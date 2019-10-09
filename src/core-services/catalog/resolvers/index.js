import getConnectionTypeResolvers from "@reactioncommerce/api-utils/graphql/getConnectionTypeResolvers.js";
import { encodeCatalogItemOpaqueId } from "../xforms/id.js";
import CatalogItemProduct from "./CatalogItemProduct/index.js";
import CatalogProduct from "./CatalogProduct/index.js";
import CatalogProductVariant from "./CatalogProductVariant/index.js";
import ImageInfo from "./ImageInfo.js";
import Mutation from "./Mutation/index.js";
import Query from "./Query/index.js";

/**
 * Catalog-related GraphQL resolvers
 * @namespace Catalog/GraphQL
 */

export default {
  CatalogItem: {
    __resolveType() {
      // For now they are all assumed to be products
      return "CatalogItemProduct";
    }
  },
  CatalogItemContent: {
    _id: (item) => encodeCatalogItemOpaqueId(item._id)
  },
  CatalogItemProduct,
  CatalogProduct,
  CatalogProductVariant,
  ImageInfo,
  Mutation,
  Query,
  ...getConnectionTypeResolvers("CatalogItem")
};
