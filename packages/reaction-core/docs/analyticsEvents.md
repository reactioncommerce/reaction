# Analytics Event Tracking

Example use:

```
<a href="{{pathForSEO 'product' 'handle'}}" data-event-category="grid" data-event-action="product-click" data-event-label="Grid product click" data-event-value="{{_id}}">
```

Send event tracking to GA by adding the following data attribute to any anchor in Reaction:

* data-event-category
* data-event-action
* data-event-label
* data-event-value

## Events Tracked

### Product Clicked from Grid View

A user clicks an individual product from the product grid view.

**Example of data captured:**

```
{
    "category" : "grid",
    "action" : "product-click",
    "label" : "grid product click",
    "value" : "BCTMZ6HTxFSppJESk",
    "shopId" : "WvrKDomkYth3THbDD",
    "_id" : "NgM5n3yjeHTMv2rnK"
}
```

### Generic Product Grid Click

A user clicks on the product grid view anywhere other than an individual product.

**Example of data captured:**

```
{
    "category" : "grid",
    "action" : "generic-click",
    "label" : "product grid click",
    "shopId" : "WvrKDomkYth3THbDD",
    "_id" : "pvfpCqpQQqyd7JAMN"
}
```

### Cart Toggle Click

A user clicks on the cart icon which toggles the drawer open/closed.

**Example of data captured:**

```
{
    "category" : "cart",
    "action" : "cart-click",
    "label" : "cart toggle click",
    "value" : "BCTMZ6HTxFSppJESk",
    "shopId" : "WvrKDomkYth3THbDD",
    "_id" : "W33j7f6KDyzLpMCac"
}
```

### Cart Item Click

A user clicks on an item in their cart.

**Example of data captured:**

```
{
    "category" : "cart",
    "action" : "product-click",
    "label" : "cart product click",
    "value" : "BCTMZ6HTxFSppJESk",
    "shopId" : "WvrKDomkYth3THbDD",
    "_id" : "wzWuz2YrvwamLF6Nh"
}
```

### Checkout Click

A user clicks on the checkout button in their cart.

**Example of data captured:**

```
{
    "category" : "cart",
    "action" : "checkout-click",
    "label" : "checkout button click",
    "value" : "BCTMZ6HTxFSppJESk",
    "shopId" : "WvrKDomkYth3THbDD",
    "_id" : "TLd5xQE9dDinzModW"
}
```

### Navigation Tag Click

A user clicks on a tag in the navigation bar.

**Example of data captured:**

```
{
    "category" : "tag",
    "action" : "tag-click",
    "label" : "navigation tag click",
    "value" : "Products",
    "shopId" : "WvrKDomkYth3THbDD",
    "_id" : "CTpcCM3d3hJtaP3An"
}
```

### Product Tag Click

A user clicks on a tag from the product detail view.

**Example of data captured:**

```
{
    "category" : "tag",
    "action" : "tag-click",
    "label" : "product detail tag click",
    "value" : "Products",
    "shopId" : "WvrKDomkYth3THbDD",
    "_id" : "zhPxLcBehiJEFd2JA"
}
```
