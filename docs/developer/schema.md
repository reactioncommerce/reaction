# Schemas
Schemas are implemented in the [reactioncommerce:reaction-schemas](https://github.com/reactioncommerce/reaction/tree/development/packages/reaction-schemas) package.

Schemas use the [simple-schema](https://github.com/aldeed/meteor-simple-schema) package.

_Example Schema Definition_

```js
/**
 * workflow schema for attaching to collection where
 * PackageWorkflow is controlling view flow
 * Shop defaultWorkflow is defined in Shop
 */

ReactionCore.Schemas.Workflow = new SimpleSchema({
  status: {
    type: String,
    defaultValue: "new"
  },
  workflow: {
    type: [String],
    optional: true
  }
});
```

## Products
In Reaction Commerce, the product database model is designed to represent the business model in the most useful way possible. As such, the "product" object itself is just a wrapper and each variant within that product is the actual thing being purchased. This matches the business reality that shoppers aren't just purchasing a tshirt, they are purchasing a red tshirt or a blue tshirt.

To take this a step further, variant options are also complete "products" that happen to have a child-parent relationship to another variant. In the same way described above, when a shopper selects a tshirt design, a color, and then a size, they are actually buying a discrete "small red tshirt" product and not just a combinations of options.

Having a top level product with various attributes and values, as is common in other major ecommerce platforms (EAV model), only makes sense as a method to reconcile the realities of ecommerce data with a rigid relational database structure (SQL). Because Reaction uses a NoSQL document database (MongoDB), the data can be stored in a structure that is much more intelligible and in alignment with the actual business model.
