Collection2
=========================

A smart package for Meteor that extends Mongo.Collection to provide support for specifying a schema and then validating against that schema when inserting and updating.

## Change Log

### 2.8.0

No changes, but `aldeed:collection2` is now a shell package that installs three component packages: `aldeed:collection2-core`, `aldeed:schema-index`, and `aldeed:schema-deny`

### 2.7.1

* Fixed an issue where an accidental breaking change in SimpleSchema v1.4.0 caused `denyInsert` and `denyUpdate` to stop working. If using SimpleSchema v1.4.0 or higher, be sure to use Collection2 v2.7.1 or higher.
* Fix upsert validation when `_id` is required in the schema
* Throw a clearer error for when all keys are removed from the document or modifier during filter cleaning

### 2.7.0

In preparation for splitting some features into separate packages, a `Collection2` object is now exported and emits a 'schema.attached' event whenever a schema is attached to a collection.

### 2.6.1

Fixed `bypassCollection2` option

### 2.6.0

Even if you skip all validation and cleaning, Collection2 will still do some object parsing that can take a long time for a large document. To bypass this, you can now set the `bypassCollection2` option to `true` when you call `insert` or `update`. This works only in server code.

### 2.5.0

* `docId` is now set in the autoValue and custom contexts for inserts, too, if possible
* The `validationContext` option can now be a reference to a context instead of a string name

### 2.4.0

* Validation and cleaning is no longer duplicated when using the `upsert` method instead of `{upsert: true}` option.
* Added `sparse` option which can be set to `true` along with `index` option to force a sparse index

### 2.3.3

Use latest simple-schema version

### 2.3.2

* Properly set `docId` in `autoValue` and `custom` contexts when provided as non-object. (Thanks @FatBoyXPC)
* Update SimpleSchema package dependency version

### 2.3.1

Fix handling of _id property on client to match server.

### 2.3.0

You can now pass an `extendedCustomContext` option when calling insert or update. Set this to an object that will be used to extend `this` within any custom validation functions that are called.

You can now pass an `extendAutoValueContext` option when calling insert or update. Set this to an object that will be used to extend `this` within any autoValue functions that are called.

Note that the `extendedCustomContext` and `extendAutoValueContext` options will work fine for calls in server code or calls against local (unmanaged) collections in client code, but they will not work with calls against normal (managed) collections in client code. When the second round of validation happens on the server, your custom contexts will not be set.

Also: When a validation `error` is passed to the `insert` or `update` callback, `error.validationContext` is now set to the validation context that was used.

### 2.2.0

* A warning is no longer shown in the server log when a schema tries to drop an index that doesn't exist.
* When your schema contains autoValues and you attach it to a LocalCollection (connection: null), the autoValues are now added properly. (Thanks @zimme)
* A new property `isLocalCollection` is set on `this` within an autoValue or custom function. (Thanks @zimme)
* You can now pass `replace: true` option to `attachSchema` to replace any already attached schemas. The default behavior is still to extend already attached schemas. (Thanks @paulellery)

### 2.1.0

You can now set `getAutoValues` to `false` when calling `insert` or `update` in server code. This will skip adding all automatic values.

### 2.0.1

Update simple-schema dependency version

### 2.0.0

* Updates for Meteor 0.9.1
* You can no longer use the `schema` constructor option to attach a schema to a collection. You must call `attachSchema` instead.
* You can now call `attachSchema` more than once. The schema you attach will extend all previous schemas you've attached. This can be useful for widely used collections like Meteor.users.

### 1.0.0

* When a client-side operation is re-validated on the server, the doc is no longer transformed first. If your validation requires that your doc be transformed using the collection's transform function prior to being validated, then you must pass the `transform: true` option to `attachSchema` when you attach the schema.
* For `custom` and `autoValue` functions, `this.docId` is now set to the `_id` property of the document being updated. This will be set only for an update or upsert, and only when the selector includes (or is) the `_id` or when the operation is initiated on the client.
* The `validate: false` option now skips the validation only. It cleans the object, including generating autoValues.

### 0.4.6

Add `filter` and `autoConvert` options to insert/update methods. Pass `false` to disable the default behavior of filtering out extra properties and autoconverting types for that insert or update operation.

### 0.4.5

When you have the `insecure` package added to your app, you expect that you do not need to define allow functions. Previously, adding `collection2` in addition to `insecure` caused you to need to define a "remove" allow function in order to remove documents from the client. This is now fixed.

### 0.4.4

If you add prototype properties to an object in a collection transform, those properties no longer interfere with proper validation or cause errors.

### 0.4.3

Error objects that are thrown or passed to callbacks due to schema validation are now better. See the "What Happens When The Document Is Invalid?" section in the README.

### 0.4.2

* Fix index error
* Add `removeEmptyStrings` option to insert/update methods. Pass `false` to disable the default behavior of removing empty string values for that insert or update operation.

### 0.4.1

Indexing fixes

### 0.4.0

* Validation errors that are caught on the server are now reactively added back on the client.
* Custom `unique` checking is removed; we now rely entirely on the unique MongoDB index to cause errors, which we use to add `notUnique` validation errors. Because of the previous point about server validation errors being sent back to the client, this should be a transparent change.
* The deprecated `Meteor.Collection2` constructor and `virtualFields` option no longer work.

### 0.3.11

A couple small changes to make sure return values and callback arguments match exactly what the original
insert/update/upsert methods would do.

### 0.3.10

* Add `attachSchema` method for attaching a schema to collections created by another package, such as Meteor.users.
* Ensure "notUnique" errors are added to invalidKeys, even when thrown on the server by MongoDB.

### 0.3.9

* Fixed some issues with `this` object in autoValue functions. `userId` and `isUpdate` were sometimes not set correctly.
* Added `isFromTrustedCode` to `this` object in autoValue and custom validation functions.

### 0.3.8

`autoValue` support moved to SimpleSchema. Collection2 continues to extend
with additional options so the net effect should be no noticeable changes.

### 0.3.7

Another tweak to ensure no allow/deny security confusion

### 0.3.6

Ensure that we don't turn off the `insecure` package

### 0.3.5

* Fix an issue where cleaning and autoValues were not done correctly when used
with a transform or virtual fields.
* `this.userId` is now available in your autoValue functions

### 0.3.4

* Define default error messages for Collection2-specific error types.
* Include the first validation error message with the generic "failed
validation" error message.
* Fixes for blackbox and custom object support

### 0.3.3

Fix update argument mix ups, for real.

### 0.3.2

* Restore ability to do unvalidated inserts and updates on the server. This
can be done with the new `validate: false` option, or by calling
myCollection._collection.insert (or update) as before. On the client, the
`validate: false` option will skip client-side validation but not server-side
validation.
* Arguments are no longer sometimes adjusted improperly when doing an update
or upsert.

### 0.3.1

Fix virtualFields support, broken by 0.3.0

### 0.3.0

* Collection2 is now enhancing the core collection object `Meteor.Collection`
instead of creating a new `Meteor.Collection2` constructor. `Meteor.Collection2`
is still available for now but is deprecated.
* There is a new `index` option for the field definition, in order to ensure an
index in the real MongoDB database. Refer to the README.
* `SmartCollection` is no longer directly supported as that package is
deprecating.
* `Offline.Collection` no longer supports schemas. This may be a temporary
change. Since it is more difficult to implement this now, we have to decide
whether this is worth doing. It might be better to re-implement from the
`offline-data` package side.

### 0.2.17

* `this.value` and `this.field().value` now return the correct value when the
value is an array. (Previously they returned just the first item of the array.)

### 0.2.16

* Add `this.isUpsert` boolean for use within an autoValue function
* Add `this.unset()` method for use within an autoValue function. Allows you
to unset any provided values when you're returning `undefined`.
* Fix autoValues for upserts. Previously, any autoValues were being added to the
selector in addition to the modifier. This is now fixed.

### 0.2.15

* Add support for `denyInsert` and `denyUpdate` options
* Add support for `autoValue` option

### 0.2.14

Deprecate some methods that are now handled by the simple-schema package, and
update docs to make the code simpler in preparation for possible future enhancements.

### 0.2.13

Allow an `Offline.Collection` to be passed to the constructor.

### 0.2.12

Don't throw notUnique error for null or undefined optional fields

### 0.2.11

* Add `check` dependency
* Add `upsert` support
* Use `transform: null` for the deny/allow callbacks

### 0.2.10

Fix `unique: true` checking for validate() and validateOne()

### 0.2.9

Fix `unique: true` checking for updates

### 0.2.8

Backwards compatibility fix

### 0.2.7

No changes

### 0.2.6

Backwards compatibility fix

### 0.2.5

Don't require allow functions when insecure package is in use

### 0.2.4

Fix IE<10 errors

### 0.2.3

Remove smart-collections weak dependency until weak dependencies work properly

### 0.2.2

Minor improvements to SmartCollection integration

### 0.2.1

Remove extra auto-added keys from doc in the insert deny function. Ensures that valid objects are recognized as valid on the server.

### 0.2.0

*(Backwards-compatibility break!)*

* Updated to use multiple validation contexts; changed API a bit
* You can now pass `smart: true` option to use a SmartCollection without pre-creating it

### 0.1.7

* Add `unique: true` support
* Allow an existing SimpleSchema to be passed in to the constructor

### 0.1.6

Fixed security/data integrity issue. Upgrade as soon as possible to ensure your app is secure.