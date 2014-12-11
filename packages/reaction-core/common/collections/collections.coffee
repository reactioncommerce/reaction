# Cart
ReactionCore.Collections.Cart = Cart = @Cart = new Mongo.Collection "Cart"
ReactionCore.Collections.Cart.attachSchema ReactionCore.Schemas.Cart

# Customers (not currently actively used)
ReactionCore.Collections.Customers = Customers = @Customers = new Mongo.Collection "Customers"
ReactionCore.Collections.Customers.attachSchema ReactionCore.Schemas.Customer

# Orders
ReactionCore.Collections.Orders = Orders = @Orders = new Mongo.Collection "Orders"
ReactionCore.Collections.Orders.attachSchema [ReactionCore.Schemas.Cart, ReactionCore.Schemas.OrderItems]

# Packages
ReactionCore.Collections.Packages = new Mongo.Collection "Packages"
ReactionCore.Collections.Packages.attachSchema ReactionCore.Schemas.PackageConfig

# Products
ReactionCore.Collections.Products = Products = @Products = new Mongo.Collection "Products"
ReactionCore.Collections.Products.attachSchema ReactionCore.Schemas.Product

# Shops
ReactionCore.Collections.Shops = Shops = @Shops = new Mongo.Collection "Shops",
  transform: (shop) ->
    for index, member of shop.members
      member.index = index
      member.user = Meteor.users.findOne member.userId
    return shop

ReactionCore.Collections.Shops.attachSchema ReactionCore.Schemas.Shop

# Tags
ReactionCore.Collections.Tags = Tags = @Tags = new Mongo.Collection "Tags"
ReactionCore.Collections.Tags.attachSchema ReactionCore.Schemas.Tag