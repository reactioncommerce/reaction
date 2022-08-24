# tagsForCatalogProducts

Give an array of CatalogProduct objects, returns an array of tags for each product ID.

Example data set:

```js
// Tags
[
  {
    _id: "1",
    name: "ONE"
  },
  {
    _id: "2",
    name: "TWO"
  },
  {
    _id: "3",
    name: "THREE"
  }
]

// CatalogProducts
[
  {
    product: {
      productId: "1",
      tagIds: ["1", "2"]
    }
  },
  {
    product: {
      productId: "2",
      tagIds: ["3"]
    }
  }
]
```

Usage:

```js
// Tags is the "Tags" Mongo.Collection
// `catalogProducts` is an array of CatalogItemProduct from Catalog collection
const result = await tagsForCatalogProducts(Tags, catalogProducts);
```

Result will be:

```js
[
  {
    productId: "1",
    tags: ["ONE", "TWO"]
  },
  {
    productId: "2",
    tags: ["THREE"]
  }
]
```
