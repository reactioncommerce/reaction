# simple-schema Reaction API Plugin

This plugin adds support for putting SimpleSchemas on context, so that other plugins can extend them.

## Usage

If you have a plugin in which you want to allow other plugins to extend one of your schemas, pass it to `registerPlugin`:

```js
import SimpleSchema from "simpl-schema";

const ProductSchema = new SimpleSchema({
  // ...
});

export default async function register(app) {
  await app.registerPlugin({
    // ...
    simpleSchemas: {
      Product: ProductSchema
    }
  });
}
```

And on the other side, if you have a plugin that wants to extend some of the schemas provided by other plugins, do it in a `preStartup` function:

```js
export default function preStartup(context) {
  context.simpleSchemas.Product.extend({
    price: PriceRange
  });
}
```
