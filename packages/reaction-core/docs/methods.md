#Methods

## Image Handling

We are using [CollectionFs](https://github.com/CollectionFS/Meteor-CollectionFS)  for file uploading handling.  There is a [CFS GraphicsMagick](https://github.com/CollectionFS/Meteor-cfs-graphicsmagick) package that handles resizing images when they are uploaded.

Take a look at */reaction-core/common/collectionFS.coffee* and you'll note that we have this commented out, but the templates should be using the appropriate collections (thumbnails, gridfs ,etc). 

It's a fairly simple matter from here to resize images on upload, and use the thumbnail size for the cart. 

The reason this isn't enabled by default this is because it requires an additional step of installing imagemagick on your server/local installation to work, and if you are deploying to meteor.com they don't have it installed serverside (and thus doesn't work).

Example use in Template:

      {{#with media}}
      <div class="center-cropped" style="background-image: url('{{url}}');">
        <img src="{{url}}" class="product-grid-item-images img-responsive">
      </div>
      {{else}}
      <div class="center-cropped" style="background-image: url('../../resources/placeholder.gif');">
        <img src="../../resources/placeholder.gif" class="product-grid-item-images img-responsive">
      </div>
      {{/with}}

## Product Methods

All product related server methods can be found in */reaction-core/server/methods/products/methods.coffee*

### createProduct

The createProduct method creates a new product with an empty variant. All products have at least one variant with pricing and details. This method can only be triggered by users with an admin role.

Usage:

```
Meteor.call "createProduct", (error, productId) ->
  if error
    # do something if error
  else
    # do something on successful callback
```

createProduct returns the insert callback from the newly created product. As with all [meteor inserts](http://docs.meteor.com/#insert), this callback includes an error object as the first argument and, if no error, the _id of the new document as the second.

### cloneProduct

The cloneProduct method clones a whole product, including all variants and images. This method can only be triggered by users with an admin role.

Usage: 

```
Meteor.call "cloneProduct", productId, (error, newCloneId) ->
  if error
    # do something if error
  else
    # do something on successful callback
```

cloneProduct takes a product object (the one you want to clone) and returns the insert callback from the newly created clone. As with all [meteor inserts](http://docs.meteor.com/#insert), this callback includes an error object as the first argument and, if no error, the _id of the new document as the second.

*Note: In the future we are going to implement an inheritance product that maintains relationships with the cloned product tree*

### deleteProduct

The deleteProduct method removes a product and unlinks it from all media. This method can only be triggered by users with an admin role. While you can use it directly, it is worth noting that we provide a maybeDeleteProduct helper, which adds a layer of confirmation and alerts around the deletion process.

Usage:

```
Meteor.call "deleteProduct", productId, (error, result) ->
  if error
    # do something if error
  else
    # do something on successful callback
```

deleteProduct takes a product _id and returns an error object as well as a result, which is true if the removal was successful or false if not.

### updateProductField

The updateProductField method updates a single product field.

Usage:

```
Meteor.call "updateProductField", productId, field, value, (error, result) ->
  if error
    # do something if error
  else
    # do something on successful callback
```

updateProductField takes a product id, a field name, and a value and updates that single product field. It then returns the meteor [update callback](http://docs.meteor.com/#update).

### updateProductTags

The updateProductTags method inserts or updates tags with hierarchy. 

Usage:

```
Meteor.call "updateProductTags", productId, tagName, tagId, (result) ->
  unless result
    # do something if error
  # do something on successful callback
```

updateProductTags will insert if given only tagName and will update existing if given tagName and tagId.

### removeProductTag

The removeProductTag method removes a single tag from a product, but preserves the tag in the database if in use elsewhere in the system.

Usage:

```
Meteor.call "removeProductTag", productId, tagId, (result) ->
  unless result
    # do something if error
  # do something on successful callback
```

removeProductTag takes a product id and tag id and returns false if called by a non-admin user.

### setHandleTag

The setHandleTag method toggles (sets or unsets) the handle for a given product. The product handle defines the direct url path for that product.

Usage:

```
Meteor.call "setHandleTag", productId, tagId, (handle) ->
  unless handle
    # do something if error
  # do something on successful callback
```

setHandleTag takes a product id and a tag id, set that tag to the handle for the product and returns the handle, which is a string of the slug.

### updateProductPosition

The updateProductPosition method updates a products position in the display grid. Position is an object with tag, position, and dimensions.

Usage:

```
Meteor.call "updateProductPosition", productId, positionData
```

updateProductPosition takes a product id and a position object.

### updateMetaFields

The updateMetaFields method updates the meta fields for a product. Meta fields consist of a title and a value, for example "Material", "100% Cotton".

Usage:

```
Meteor.call "updateMetaFields", productId, updatedMeta
```

updateMetaFields takes a product id and a meta object that includes a key ("Material") and a value ("100% Cotton").

### createVariant

The createVariant method initializes an empty variant template for a product. All other variants are clones and so this should only be seen when all variants have been deleted from a product.

Usage:

```
Meteor.call "updateMetaFields", productId
```

### cloneVariant

The cloneVariant method copies variants, but will also create and clone child variants (options)

Usage:

```
# to clone a variant
Meteor.call "cloneVariant", productId, variantId

# to create a child option from a variant
Meteor.call "cloneVariant", productId, variantId, parentId
```

cloneVariant takes a product id, a variant id to clone a variant. Adding a parent id will make the new clone as an option of that parent.

### updateVariant

The updateVariant method updates an individual variant with new values and merges into the original.

Usage:

```
Meteor.call "updateVariant", variant
```

updateVariant takes a variant object which only needs to include fields which are being updated.

### updateVaraints

The updateVariants method updates a whole variants array.

Usage:

```
Meteor.call "updateVariants", variants
```

updateVaraints takes a whole variant array object and updates the included fields.

## Other Methods

### locateAddress

The locateAddress method determines a user's street address based on latitude and longitude coordinates or by ip address.

Usage:
```
Meteor.call "locateAddress", latitude, longitude, (address) ->
  # do something on callback
```

locateAddress takes latitude and longitude in [degree format](https://developers.google.com/maps/documentation/business/geolocation/#responses) and uses a reverse geolocation lookup to determine street address. If coordinates are not provided, the method attempts to use the users ip address to determine general location. An address is returned in this format:

```
[{
  latitude: Number
  longitude: Number
  country: String
  city: String
  state: String
  stateCode: String
  zipcode: String
  streetName: String
  streetNumber: String
  countryCode: String
}]
```

If no address can be found, then the following address object is returned:

```
[{
  latitude: null
  longitude: null
  country: "United States"
  city: null
  state: null
  stateCode: null
  zipcode: null
  streetName: null
  streetNumber: null
  countryCode: "US"
}]
```
