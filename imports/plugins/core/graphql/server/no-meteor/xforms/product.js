import { assoc, compose, map, toPairs } from "ramda";
import { namespaces } from "@reactioncommerce/reaction-graphql-utils";
import { assocInternalId, assocOpaqueId, decodeOpaqueIdForNamespace, encodeOpaqueId } from "./id";

export const assocProductInternalId = assocInternalId(namespaces.Product);
export const assocProductOpaqueId = assocOpaqueId(namespaces.Product);
export const decodeProductOpaqueId = decodeOpaqueIdForNamespace(namespaces.Product);
export const encodeProductOpaqueId = encodeOpaqueId(namespaces.Product);

// add `currencyCode` keys to each pricing info object
const xformPricingEntry = ([k, v]) => compose(assoc("currencyCode", k))(v);

// map over all provided pricing info, provided in the format stored in our Catalog collection,
// and convert them to an array
export const xformPricingArray = compose(map(xformPricingEntry), toPairs);
