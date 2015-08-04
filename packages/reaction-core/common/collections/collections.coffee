###
# Cart
#
# methods to return cart calculated values
# cartCount, cartSubTotal, cartShipping, cartTaxes, cartTotal
# are calculated by a transformation on the collection
# and are available to use in template as cart.xxx
# in template: {{cart.cartCount}}
# in code: ReactionCore.Collections.Cart.findOne().cartTotal()
###
ReactionCore.Helpers.cartTransform =
  cartCount : ->
    count = 0
    ((count += items.quantity) for items in this.items) if this?.items
    return count
  cartShipping : ->
    shipping = 0
    if this?.shipping?.shipmentMethod?.rate
      shipping = this?.shipping?.shipmentMethod?.rate
    else ((shipping += shippingMethod.rate) for shippingMethod in this.shipping.shipmentMethod) if this?.shipping?.shipmentMethod.length > 0
    return shipping
  cartSubTotal : ->
    subtotal = 0
    ((subtotal += (items.quantity * items.variants.price)) for items in this.items) if this?.items
    subtotal = subtotal.toFixed(2)
    return subtotal
  cartTaxes : ->
    ###
    # TODO: lookup cart taxes, and apply rules here
    ###
    return "0.00"
  cartDiscounts : ->
    ###
    # TODO: lookup discounts, and apply rules here
    ###
    return "0.00"
  cartTotal : ->
    subtotal = 0
    ((subtotal += (items.quantity * items.variants.price)) for items in this.items) if this?.items
    shipping = 0
    if this?.shipping?.shipmentMethod?.rate
      shipping = this?.shipping?.shipmentMethod?.rate
    else ((shipping += shippingMethod.rate) for shippingMethod in this.shipping.shipmentMethod) if this?.shipping?.shipmentMethod.length > 0
    shipping = parseFloat shipping
    subtotal = (subtotal + shipping) unless isNaN(shipping)
    total = subtotal.toFixed(2)
    return total


ReactionCore.Collections.Cart = Cart = @Cart = new Mongo.Collection "Cart",
  transform: (cart) ->
    newInstance = Object.create(ReactionCore.Helpers.cartTransform);
    return  _.extend newInstance, cart;

ReactionCore.Collections.Cart.attachSchema ReactionCore.Schemas.Cart

# Accounts
ReactionCore.Collections.Accounts = new Mongo.Collection "Accounts"
ReactionCore.Collections.Accounts.attachSchema ReactionCore.Schemas.Accounts

# Orders
ReactionCore.Collections.Orders = Orders = @Orders = new Mongo.Collection "Orders",
  transform: (order) ->
    order.itemCount = ->
      count = 0
      ((count += items.quantity) for items in order.items) if order?.items
      return count
    return order

ReactionCore.Collections.Orders.attachSchema [ReactionCore.Schemas.Cart, ReactionCore.Schemas.Order, ReactionCore.Schemas.OrderItems]

# Packages
ReactionCore.Collections.Packages = new Mongo.Collection "Packages"
ReactionCore.Collections.Packages.attachSchema ReactionCore.Schemas.PackageConfig

# Products
ReactionCore.Collections.Products = Products = @Products = new Mongo.Collection "Products"
ReactionCore.Collections.Products.attachSchema ReactionCore.Schemas.Product

# Shipping
ReactionCore.Collections.Shipping = new Mongo.Collection "Shipping"
ReactionCore.Collections.Shipping.attachSchema ReactionCore.Schemas.Shipping

# Taxes
ReactionCore.Collections.Taxes = new Mongo.Collection "Taxes"
ReactionCore.Collections.Taxes.attachSchema ReactionCore.Schemas.Taxes

# Discounts
ReactionCore.Collections.Discounts = new Mongo.Collection "Discounts"
ReactionCore.Collections.Discounts.attachSchema ReactionCore.Schemas.Discounts

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

# Tags
ReactionCore.Collections.Translations = new Mongo.Collection "Translations"
ReactionCore.Collections.Translations.attachSchema ReactionCore.Schemas.Translation
