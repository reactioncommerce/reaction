# Relationships

This is work-in-progress documentation for potentially supporting relationships
between and among collection2s. Once the documentation makes sense and
supports all use cases, development will be done to match the docs. See
[issue #31](https://github.com/aldeed/meteor-collection2/issues/31) for
discussion.

```js
Manufacturers = new Mongo.Collection('manufacturers', {
  schema: {
    name: {
      type: String
    }
  }
});

Colors = new Mongo.Collection('colors', {
  schema: {
    name: {
      type: String
    },
    cars: {
      type: [Cars],
      optional: true
    }
  }
});

Features = new Mongo.Collection('features', {
  schema: {
    name: {
      type: String
    }
  }
});

Cars = new Mongo.Collection('car', {
  schema: {
    manufacturer: {
      type: Manufacturers
    },
    color: {
      type: Colors,
      optional: true
    },
    features: {
      type: [Features],
      optional: true
    }
  }
});
```

Every car must have exactly one manufacturer. This will be the _id of the
document in the Manufacturers collection. The value may not be an _id that
does not exist in the Manufacturers collection.

Every car may have 0 or 1 color. This will be the _id of the
document in the Colors collection. The value may not be an _id that
does not exist in the Colors collection, but it may be null or undefined.

Note that Colors defines the reverse relationship ("cars"), but Manufacturers
does not. If a reverse relationship is defined, collection2 automatically keeps
the related keys in sync. (NOTE: This would be nice, but we'll have to see how feasible
it is.) Also, you can then perform inserts and updates against either collection.

## Inserts

* If type is a Mongo.Collection instance and field value is a string, ensure that
the value is an _id in the related Mongo.Collection before allowing insertion.
* If type is an array containing a Mongo.Collection instance and field value is an
array containing strings, ensure that all values in the array are _ids in the
related Mongo.Collection before allowing insertion.
* If type is a Mongo.Collection instance and field value is an object, first insert the
object into the related Mongo.Collection, then set the resulting _id as the
new field value, and then do the insert. If any insert fails, roll back others.
* If type is an array containing a Mongo.Collection instance and field value is an
array containing objects, first insert all objects into the related Mongo.Collection,
then set the field value to be an array of the resulting IDs, and then do the
insert. If any insert fails, roll back others.

## Updates and Upserts

Similar to inserts. Will validate that any _ids exist in the related Mongo.Collection.
Will also forward updates to the related Mongo.Collection and roll back updates if
any updates fail. For example:

```js
// Assuming:
// car: { _id: "4rjv989j4r0v", manufacturer: "h923nrfp9834", color: "9n3ef890n34" }
// color: { _id: "9n3ef890n34", name: "Blue" }

// This:
Cars.update(id, {$set: {color.name: "Red"}});

// Results in this:
// car: { _id: "4rjv989j4r0v", manufacturer: "h923nrfp9834", color: "9n3ef890n34" }
// color: { _id: "9n3ef890n34", name: "Red" }
```

## Remove

Whenever we remove a document that is referenced by another Mongo.Collection, we
will automatically unset all referencing fields. If unsetting would result in
any of the fields being empty but yet that field is required, then the removal
will fail.

We could also support an `onRemove: "cascade"` or `cascade: true` option to
allow cascading deletions.

## AutoForm

You can use fields from related collections within an autoForm. For example,
in the "Cars" autoForm, you can use "color.name" as a field name.

If you use a field that has a `type` that is a Mongo.Collection instance, autoform
will automatically provide select options based on `_id` and `name` fields
from the related Mongo.Collection. You may override with your own options to use
a field other than `name` or to show a limited subset of all documents. You can
also use `allowedValues` to limit which `_id`s should be shown in the options list.

If you use a field that has a `type` that is an array containing a
Mongo.Collection instance, it will work the same as above, except that the field
will allow multiple selections (either a multiple select or check boxes).

Few changes will be needed to the current submit/insert/update code for autoForm.
Mongo.Collection will interpret what needs to be done based on the structure of the
document or modifier.

## Validation

The easiest way to validate relationships is probably to update simpleSchema to
look for `simpleSchema()` method on any unknown `type` values. If found, validate
objects against the inner schema, or allow strings (_ids).

Other changes will be necessary, probably within the aldeed:collection2 package. For example,
maxCount and minCount should be respected even if the relationship is stored in
the foreign collection.