### **************************************************************
# Template Cart Items
# ************************************************************ ###
Template.cartItems.preserve([".cart-item-image"])

Handlebars.registerHelper "cartItem", () ->

  showLowInventoryWarning: (variant) ->
    if variant?.lowInventoryWarning and variant?.lowInventoryWarningThreshold
      if (variant?.inventoryQuantity < variant.lowInventoryWarningThreshold)
        return true
    return false


