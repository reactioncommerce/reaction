ShopifyProducts.permit(['insert', 'update', 'remove']).ifHasRole({
  role: ['admin', 'createProduct'],
  group: ReactionCore.getShopId()
}).ifShopIdMatchesThisId().apply();

Bundles.permit(['insert', 'update', 'remove']).ifHasRole({
  role: ['admin', 'createProduct'],
  group: ReactionCore.getShopId()
}).ifShopIdMatchesThisId().apply();
