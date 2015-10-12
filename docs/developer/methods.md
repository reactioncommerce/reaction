# Methods
## Image Handling
We are using [CollectionFs](https://github.com/CollectionFS/Meteor-CollectionFS)  for file uploading handling.  There is a [CFS GraphicsMagick](https://github.com/CollectionFS/Meteor-cfs-graphicsmagick) package that handles resizing images when they are uploaded.

Take a look at _/reaction-core/common/collectionFS.coffee_ and you'll note that we have this commented out, but the templates should be using the appropriate collections (thumbnails, gridfs ,etc).

It's a fairly simple matter from here to resize images on upload, and use the thumbnail size for the cart.

The reason this isn't enabled by default this is because it requires an additional step of installing imagemagick on your server/local installation to work, and if you are deploying to meteor.com they don't have it installed serverside (and thus doesn't work).

Example use in Template:

```
  {{#with media}}
  <div class="center-cropped" style="background-image: url('{{url}}');">
    <img src="{{url}}" class="product-grid-item-images img-responsive">
  </div>
  {{else}}
  <div class="center-cropped" style="background-image: url('/resources/placeholder.gif');">
    <img src= "/resources/placeholder.gif" class="product-grid-item-images img-responsive">
  </div>
  {{/with}}
```

## Product Methods
All product related server methods can be found in _/reaction-core/server/methods/products/methods.coffee_

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

createProduct returns the insert callback from the newly created product. As with all [meteor inserts](https://docs.meteor.com/#insert), this callback includes an error object as the first argument and, if no error, the _id of the new document as the second.

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

cloneProduct takes a product object (the one you want to clone) and returns the insert callback from the newly created clone. As with all [meteor inserts](https://docs.meteor.com/#insert), this callback includes an error object as the first argument and, if no error, the _id of the new document as the second.

_Note: In the future we are going to implement an inheritance product that maintains relationships with the cloned product tree_

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

updateProductField takes a product id, a field name, and a value and updates that single product field. It then returns the meteor [update callback](https://docs.meteor.com/#update).

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

### products/cloneVariant
The products/cloneVariant method copies variants, but will also create and clone child variants (options)

Usage:

```
# to clone a variant
Meteor.call "products/cloneVariant", productId, variantId

# to create a child option from a variant
Meteor.call "products/cloneVariant", productId, variantId, parentId
```

products/cloneVariant takes a product id, a variant id to clone a variant. Adding a parent id will make the new clone as an option of that parent.

### updateVariant
The updateVariant method updates an individual variant with new values and merges into the original.

Usage:

```
Meteor.call "updateVariant", variant
```

updateVariant takes a variant object which only needs to include fields which are being updated.

### updateVariants
The updateVariants method updates a whole variants array.

Usage:

```
Meteor.call "updateVariants", variants
```

updateVariants takes a whole variant array object and updates the included fields.


## Order Methods
All order related Meteor methods can be found in [/reaction-core/server/methods/orders.js](https://github.com/reactioncommerce/reaction-core/server/methods/orders.js)

### orders/inventoryAdjust

Called when the customer places an order. It's triggered by entering a credit card that that is not declined and clicking the check out button. The function loops through each Product in an order and adjusts the quantity for that product variant.

```javascript
  ReactionCore.Collections.Products.update({
    "_id": product.productId,
    "variants._id": product.variants._id
  }, {
    $inc: {
      "variants.$.inventoryQuantity": -product.quantity
    });
```

### orders/addOrderEmail
Called when a customer has checked out as a guest, then adds an email within the order confirmation page. This also adds an email field to `ReactionCore.Collections.Orders.email`

### orders/updateHistory
Called when any Order event occurs. The first occurance is when a user clicks on the newly created order, but also called  when the **begin** button is clicked or tracking number added etc. It extends the history object with additional fields to `ReactionCore.Collections.Orders.history`

```javascript
    "history": {
      event: event,
      value: value,
      userId: Meteor.userId(),
      updatedAt: new Date()
    }
```

### orders/shipmentTracking 
Called when a tracking number has been entered and the **Add** button was clicked. This also triggers `addTracking` and `updateHistory`. This method verifies the order and tracking, then calls addTracking and updateHistory and updates the workflow/pushOrderWorkflow status.

### orders/addTracking 
Called when a tracking number has been entered and the **Add** button has been clicked.  This updates `ReactionCore.Collections.Orders.shipping.shipmentMethod.tracking`

### orders/documentPrepare
Called when the **Download PDF** button is clicked or when the Adjustment *Approved* button is clicked. This also calls updateHistory and updated that shipment is being prepared.

### orders/processPayment 
This method calls the `processPayments` and also updates the workflow status.

### orders/processPayments
Determines the payment method and hits the payment API to capture the payment. If successful it updates `ReactionCore.Collections.Orders.payment.paymentMethod.transactionId` else it throws an error :

```javascript
if (result.capture) {
  transactionId = paymentMethod.transactionId;
  ReactionCore.Collections.Orders.update({
    "_id": orderId,
    "payment.paymentMethod.transactionId": transactionId
  }, {
    $set: {
      "payment.paymentMethod.$.transactionId": result.capture.id,
      "payment.paymentMethod.$.mode": "capture",
      "payment.paymentMethod.$.status": "completed"
    }
  });

} else {
  ReactionCore.Events.warn("Failed to capture transaction.", order, paymentMethod.transactionId);
  throw new Meteor.Error("Failed to capture transaction");
}
```

### orders/shipmentShipped
Called when payment is completed and updates the work flow to the coreShipmentShipped status.

### orders/orderCompleted
Called when the order has been completed. This updates the workflow status and also updated the order with the OrderCompleted Status.

### orders/shipmentPacking
Updates the workflow status that the shipment is being packed.

### orders/updateDocument
Updates the order with a reference to the specific doc created for shipping and label.

```javascript
ReactionCore.Collections.Orders.update(orderId, {
      $addToSet: {
        documents: {
          docId: docId,
          docType: docType
        }
      }
    });
```


### orders/addItemToShipment
This adds an item to the Orders.shipping.items array.
```javascript
ReactionCore.Collections.Orders.update({
      "_id": orderId,
      "shipping._id": shipmentId
    }, {
      $push: {
        "shipping.$.items": item
      }
    });
```
### orders/updateShipmentItem
This updates the items that are being associatated with a specific shipping id.

### orders/removeShipment
This method removed the shipment information from an order. It sets shipment object to null.
```javascript
ReactionCore.Collections.Orders.update(orderId, {
      $pull: {
        shipments: null
      }
    });
```
### orders/capturePayments
Cycles through each Orders paymentMethod and attempts to capture the payment. If successful it updates the Paymentmethod status to completed. Else it throws a server warning that payment was not captured.

### orders/updateShipmentTracking
updated the shipment tracking information.

## Other Methods
### locateAddress
The locateAddress method determines a user's street address based on latitude and longitude coordinates or by ip address.

Usage:

```
Meteor.call "locateAddress", latitude, longitude, (address) ->
  # do something on callback
```

locateAddress takes latitude and longitude in [decimal degree format](https://en.wikipedia.org/wiki/Decimal_degrees) and uses a reverse geolocation lookup to determine street address. If coordinates are not provided, the method attempts to use the user's ip address to determine general location. An address is returned in this format:

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

For more information on how geocoding works in Reaction, check out the [meteor-geocoder package](https://github.com/aldeed/meteor-geocoder)

### updateHeaderTags
The updateHeaderTags method inserts or updates navigation tags taking into account hierarchy.

Usage:

```
Meteor.call "updateHeaderTags", tagName, tagId, currentTagId
```

If given only `tagName`, updateHeaderTags will insert a new top level tag. If given `tagName` and `tagId`, updateHeaderTags will update an existing tag. Adding `currentTagId` will give parental hierarchy.

### removeHeaderTag
The removeHeaderTag method removes a tag from the navigation. It also checks to make sure the tag isn't in use elsewhere before removing it completely from the system.

Usage:

```
Meteor.call "updateHeaderTags", tagId, currentTagId (error) ->
  if error
    # do something if error
```

removeHeaderTag takes a tag id (`tagId`) and optionally the id of the parent tag (`currentTagId`) and returns an error object if something goes wrong. If `currentTagId` is present, then `tagId` is removed as a related tag. Either way the method checks to see if `tagId` is in use elsewhere in the system, and if not the tag is removed completely.

### Cart Workflow
  See: [Cart workflow documentation](workflow.md)
