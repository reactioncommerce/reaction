#Methods

## Image Handling

We are using [CollectionFs](https://github.com/CollectionFS/Meteor-CollectionFS)  for file uploading handling.  There is a [CFS GraphicsMagick](https://github.com/CollectionFS/Meteor-cfs-graphicsmagick) package that handles resizing images when they are uploaded.

Take a look at */reaction-core/common/collectionFS.coffee* and you'll note that we have this commented out, but the templates should be using the appropriate collections (thumbnails, gridfs ,etc). 

It's a fairly simple matter from here to resize images on upload, and use the thumbnail size for the cart. 

The reason this isn't enabled by default this is because it requires an additional step of installing imagemagick on your server/local installation to work, and if you are deploying to meteor.com they don't have it installed serverside (and thus doesn't work).