import { encodeCatalogItemOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/catalogItem";
import CatalogItemConnection from "./CatalogItemConnection";
import CatalogItemEdge from "./CatalogItemEdge";
import CatalogItemProduct from "./CatalogItemProduct";
import CatalogProduct from "./CatalogProduct";
import CatalogProductVariant from "./CatalogProductVariant";
import Query from "./Query";

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
  CatalogItemConnection,
  CatalogItemEdge,
  CatalogItemProduct,
  CatalogProduct,
  CatalogProductVariant,
  Query
};
