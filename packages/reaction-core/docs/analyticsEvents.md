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
    "label" : "Grid product click",
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

### Cart Item Click

A user clicks on an item in their cart.

**Example of data captured:**

```
{
    "category" : "cart",
    "action" : "product-click",
    "label" : "Cart product click",
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
    "label" : "Checkout button click",
    "value" : "BCTMZ6HTxFSppJESk",
    "shopId" : "WvrKDomkYth3THbDD",
    "_id" : "TLd5xQE9dDinzModW"
}
```

### Tag Click

A user clicks on a navigation tag

**Example of data captured:**

```
{
    "category" : "tag",
    "action" : "tag-click",
    "label" : "Navigation Tag Click",
    "value" : "Products",
    "shopId" : "WvrKDomkYth3THbDD",
    "_id" : "CTpcCM3d3hJtaP3An"
}
```
