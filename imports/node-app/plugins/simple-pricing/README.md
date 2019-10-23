# Simple Pricing

Pricing data falls under it's own domain within the Reaction Commerce system, however it currently needs to be intertwined and available from other system domains (i.e., Catalog, Cart, Checkout, Orders). To give us more flexibility in pricing data management we've begun to move pricing get/set functions into this `simple-pricing` plugin and calling these functions from the `context.queries` object from within their respective functions. Now we can fully replace the pricing management system without modification to core by creating a custom plugin that replaces the `simple-pricing` queries.

## Queries

Any pricing plugin is expected to define and register the following query functions.

### getVariantPrice

This query function is used to get a product variant's real current price.
