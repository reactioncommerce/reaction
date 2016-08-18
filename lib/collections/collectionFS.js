/**
 * core collectionsFS configurations
 */
FS.HTTP.setBaseUrl("/assets");
FS.HTTP.setHeadersForGet([
  ["Cache-Control", "public, max-age=31536000"]
]);

/**
 * Define CollectionFS collection
 * See: https://github.com/CollectionFS/Meteor-CollectionFS
 * chunkSize: 1024*1024*2; <- CFS default // 256k is default GridFS chunk size, but performs terribly
 */

export const Media = new FS.Collection("Media", {
  stores: [
    new FS.Store.GridFS("image", {
      chunkSize: 1 * 1024 * 1024
    }), new FS.Store.GridFS("large", {
      chunkSize: 1 * 1024 * 1024,
      transformWrite: function (fileObj, readStream, writeStream) {
        if (gm.isAvailable) {
          gm(readStream, fileObj.name).resize("1000", "1000").stream()
            .pipe(writeStream);
        } else {
          readStream.pipe(writeStream);
        }
      }
    }), new FS.Store.GridFS("medium", {
      chunkSize: 1 * 1024 * 1024,
      transformWrite: function (fileObj, readStream, writeStream) {
        if (gm.isAvailable) {
          gm(readStream, fileObj.name).resize("600", "600").stream().pipe(
            writeStream);
        } else {
          readStream.pipe(writeStream);
        }
      }
    }), new FS.Store.GridFS("small", {
      chunkSize: 1 * 1024 * 1024,
      transformWrite: function (fileObj, readStream, writeStream) {
        if (gm.isAvailable) {
          gm(readStream).resize("235", "235" + "^").gravity("Center")
            .extent("235", "235").stream("PNG").pipe(writeStream);
        } else {
          readStream.pipe(writeStream);
        }
      }
    }), new FS.Store.GridFS("thumbnail", {
      chunkSize: 1 * 1024 * 1024,
      transformWrite: function (fileObj, readStream, writeStream) {
        if (gm.isAvailable) {
          gm(readStream).resize("100", "100" + "^").gravity("Center")
            .extent("100", "100").stream("PNG").pipe(writeStream);
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
