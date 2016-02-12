ReactionCore.Collections.InventoryVariants = InventoryVariants = this.InventoryVariants = new Mongo.Collection('InventoryVariants');

ReactionCore.Collections.Products.attachSchema(ReactionCore.Schemas.RentalProduct);

ReactionCore.Collections.Cart.attachSchema(ReactionCore.Schemas.RentalCart);

ReactionCore.Collections.Orders.attachSchema([ReactionCore.Schemas.RentalCart, ReactionCore.Schemas.RentalOrder]);

ReactionCore.Collections.Shops.attachSchema(ReactionCore.Schemas.RentalShop);

ReactionCore.Collections.InventoryVariants.attachSchema(ReactionCore.Schemas.InventoryVariants);
