import { resolveShopFromShopId } from "@reactioncommerce/reaction-graphql-utils";
import primaryImage from "./primaryImage";
import tags from "./tags";

export default {
  primaryImage,
  shop: resolveShopFromShopId,
  tags
};
