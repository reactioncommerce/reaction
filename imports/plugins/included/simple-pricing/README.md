# Simple Pricing

Pricing data falls under it's own domain within the Reaction Commerce system, however it currently needs to be intertwined and available from other system domains (i.e., Catalog, Cart, Checkout, Orders). To give us more flexibility in pricing data management we've begun to move pricing get/set functions into this `simple-pricing` plugin and calling these functions from the `context.queries` object from within their respective functions. Now we can fully replace the pricing management system without modification to core by creating a custom plugin that replaces the `simple-pricing` queries.

**Example**

``` js
// old addCartItems() funcitons

...
const {
      catalogProduct,
      parentVariant,
      variant: chosenVariant
    } = await findProductAndVariant(collections, productId, productVariantId);

    const variantPriceInfo = chosenVariant.pricing[providedPrice.currencyCode];
    if (!variantPriceInfo) {
      throw new ReactionError("invalid-param", `This product variant does not have a price for ${price.currencyCode}`);
    }
...

// new addCartItems() function with simple-pricing
const {
      catalogProduct,
      parentVariant,
      variant: chosenVariant
    } = await findProductAndVariant(collections, productId, productVariantId);

    const variantPriceInfo = queries.getCartPrice(chosenVariant, price);
    if (!variantPriceInfo) {
      throw new ReactionError("invalid-param", `This product variant does not have a price for ${price.currencyCode}`);
    }
```

## Queries

### Cart Price Queries
**getCartPrice**

**getCurrentCatalogPriceForProductConfiguration**

**getVariantPricingMap**

**updateCartItemsForVariantPriceChange**

### Catalog Price Queries
TBD
