ReactionCore.Collections.Bundles = Bundles = this.Bundles = new Mongo.Collection('Bundles');
ReactionCore.Collections.ShopifyProducts = ShopifyProducts = this.ShopifyProducts = new Mongo.Collection('ShopifyProducts');

ReactionCore.Collections.Bundles.attachSchema(ReactionCore.Schemas.Bundles);
ReactionCore.Collections.ShopifyProducts.attachSchema(ReactionCore.Schemas.ShopifyProducts);
