const sharp = Meteor.isServer ? require("sharp") : undefined;

/**
 * @file CollectionFS configuration and settings
 *
 * Reaction Commerce uses {@link https://github.com/CollectionFS/Meteor-CollectionFS|CollectionFS}
 * to upload images and ImageMagick to handle resizing and manipulating images.
 * See {@link https://docs.reactioncommerce.com/reaction-docs/master/image-handling|Reaction Docs} for examples.
 *
 * @class FS.Collection
 */

FS.HTTP.setBaseUrl("/assets");
FS.HTTP.setHeadersForGet([
  ["Cache-Control", "public, max-age=31536000"]
]);

/**
 * @name Media
 * @memberof FS.Collection
 * @type FS.Collection
 * @summary Defines {@link https://github.com/CollectionFS/Meteor-CollectionFS|CollectionFS} collection configuration
 * Image files are resized to 4 different square sizes:
 * 1. `image` - 1000px by 1000px
 * 2. `medium` - 600px by 600px
 * 3. `small` - 235px by 235px
 * 4. `thumbnail` - 100px by 100px
 * `chunkSize` 1024*1024*2 is the CFS default
 * 256k is default GridFS `chunkSize`, but performs terribly
 * To learn how to further manipulate images with ImageMagick, refer to the
 * {@link https://github.com/CollectionFS/Meteor-CollectionFS/wiki/|CollectionFS wiki} and the
 * @see https://github.com/CollectionFS/Meteor-CollectionFS
 */
export const Media = new FS.Collection("Media", {
  stores: [
    new FS.Store.GridFS("image", {
      chunkSize: 1 * 1024 * 1024
    }), new FS.Store.GridFS("large", {
      chunkSize: 1 * 1024 * 1024,
      transformWrite(fileObj, readStream, writeStream) {
        if (sharp) {
          const imgTransform = sharp().resize(1000, 1000).max();
          readStream.pipe(imgTransform).pipe(writeStream);
        } else {
          readStream.pipe(writeStream);
        }
      }
    }), new FS.Store.GridFS("medium", {
      chunkSize: 1 * 1024 * 1024,
      transformWrite(fileObj, readStream, writeStream) {
        if (sharp) {
          const imgTransform = sharp().resize(600, 600).max();
          readStream.pipe(imgTransform).pipe(writeStream);
        } else {
          readStream.pipe(writeStream);
        }
      }
    }), new FS.Store.GridFS("small", {
      chunkSize: 1 * 1024 * 1024,
      transformWrite(fileObj, readStream, writeStream) {
        if (sharp) {
          const imgTransform = sharp().resize(235, 235).png();
          readStream.pipe(imgTransform).pipe(writeStream);
        } else {
          readStream.pipe(writeStream);
        }
      }
    }), new FS.Store.GridFS("thumbnail", {
      chunkSize: 1 * 1024 * 1024,
      transformWrite(fileObj, readStream, writeStream) {
        if (sharp) {
          const imgTransform = sharp().resize(100, 100).png();
          readStream.pipe(imgTransform).pipe(writeStream);
        } else {
          readStream.pipe(writeStream);
        }
      }
    })
  ],
  filter: {
    allow: {
      contentTypes: ["image/*"]
    }
  }
});
