# Inventory
The [reactioncommerce:reaction-inventory](https://github.com/reactioncommerce/reaction-inventory) package implements inventory methods that are triggered with **collection hooks**.

The hooks trigger updates to the `Inventory` collection on `Product` and `Cart` collection changes.

# Methods
## "inventory/setStatus"
Sets matching inventory `Inventory.workflow.status` to a new status. Defaults to `new` to `reserved`.

## "inventory/clearStatus"
Accepts a status and currentStatus. Used to reset status on inventory item. Defaults to "new".

## "inventory/clearReserve"
Resets `reserved` ReactionCore.Schemas.CartItem objects to `new`.

## "inventory/addReserve"
Set `reserved` status ReactionCore.Schemas.CartItem object.

## "inventory/backorder"
Set `backorder` status  for a ReactionCore.Schemas.CartItem object.

## "inventory/lowStock"
WIP - will be used to send email notifications on low inventory levels.

## "inventory/register"
Check a `ReactionCore.Schemas.Product` object and update `Inventory` collection with inventory documents.

## "inventory/adjust"
Adjusts existing `ReactionCore.Schemas.Product` documents when changes are made we get the inventoryQuantity for each product variant,and compare the qty to the qty in the inventory records we will add inventoryItems as needed to have the same amount as the inventoryQuantity but when deleting, we'll refuse to delete anything not **workflow.status="new"**.

## "inventory/remove"
Remove an inventory item permanently

## "inventory/shipped"
Set status of inventory to `shipped`.

## "inventory/return"
Set status of returned inventory to `return`.

## "inventory/returnToStock"
Set status of `return` items to `new`.
