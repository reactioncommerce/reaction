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
"click #add-product-link": (event, template) ->
  Meteor.call "createProduct", (error, productId) ->
    if error
      console.log error
    else if productId
      Router.go "product",
        _id: productId
```

createProduct returns the insert callback from the newly created product. As with all [meteor inserts](http://docs.meteor.com/#insert), this callback includes an error object as the first argument and, if no error, the _id of the new document as the second.

### cloneProduct

The cloneProduct method clones a whole product, including all variants and images. This method can only be triggered by users with an admin role.

Usage: 

			Template.productGridItems.events
			  'click .clone-product': () ->
			    Meteor.call "cloneProduct", this, (error, productId) ->
			      console.log error if error
			      Router.go "product",
			        _id: productId

cloneProduct takes a product object (the one you want to clone) and returns the insert callback from the newly created clone. As with all [meteor inserts](http://docs.meteor.com/#insert), this callback includes an error object as the first argument and, if no error, the _id of the new document as the second.

*Note: In the future we are going to implement an inheritance product that maintains relationships with the cloned product tree*

### deleteProduct

The deleteProduct method removes a product and unlinks it from all media. This method can only be triggered by users with an admin role. While you can use it directly, it is worth noting that we provide a maybeDeleteProduct helper, which adds a layer of confirmation and alerts around the deletion process.

Usage:

```
'click .delete-product': (event, template) ->
  Meteor.call "deleteProduct", this._id, (error, result) ->
    if error or not result
      Alerts.add "There was an error deleting " + title, "danger", type: "prod-delete-" + id
      console.log "Error deleting product " + id, error
	  else
	    setCurrentProduct null
	    Router.go "/"
	    Alerts.add "Deleted " + title, "info", type: "prod-delete-" + id
```

deleteProduct takes a product _id and returns an error object as well as a result, which is true if the removal was successful or false if not.