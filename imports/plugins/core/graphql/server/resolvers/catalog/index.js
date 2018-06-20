import { encodeCatalogItemOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/catalogItem";
import { getConnectionTypeResolvers } from "@reactioncommerce/reaction-graphql-utils";
import CatalogItemProduct from "./CatalogItemProduct";
import CatalogProduct from "./CatalogProduct";
import CatalogProductVariant from "./CatalogProductVariant";
import ImageInfo from "./ImageInfo";
import Mutation from "./Mutation";
import Query from "./Query";
import ProductPricingInfo from "./ProductPricingInfo";

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
  ProductPricingInfo,
  ...getConnectionTypeResolvers("CatalogItem")
};
