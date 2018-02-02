// lazy loading sharp package
let sharp;
async function lazyLoadSharp() {
  if (sharp) return;
  const mod = await import("sharp");
  sharp = mod.default;
}


/**
 * @file CollectionFS configuration and settings
 *
 * Reaction Commerce uses {@link https://github.com/CollectionFS/Meteor-CollectionFS|CollectionFS}
 * to upload images and Sharp to handle resizing and manipulating images.
 * See {@link https://docs.reactioncommerce.com/reaction-docs/master/image-handling|Reaction Docs} for examples.
 *
 * @class FS.Collection
 */

FS.HTTP.setBaseUrl("/assets");
FS.HTTP.setHeadersForGet([
  ["Cache-Control", "public, max-age=31536000"]
]);

/**
 * @name imgTransforms
 * @constant {Array}
 * @property {string} name - transform name that will be used as GridFS name
 * @property {object|undefined} transform - object with image transform settings
 * @property {number} size - transform size, only one number needed for both width & height
 * @property {string} mod - transform modifier function call,
 * for example the `large` & `medium` image transforms want to preserve
 * the image's aspect ratio and resize based on the larger width or height
 * so we use the `max` Sharp modifier function.
 * Check out the {@link http://sharp.pixelplumbing.com/en/stable/|Sharp Docs} for more helper functions.
 * {@link http://sharp.pixelplumbing.com/en/stable/api-resize/#max|Sharp max()}
 * {@link http://sharp.pixelplumbing.com/en/stable/api-resize/#crop|Sharp crop()}
 * @property {string} format - output image format
 * @summary Defines all image transforms
 * Image files are resized to 4 different sizes:
 * 1. `large` - 1000px by 1000px - preserves aspect ratio
 * 2. `medium` - 600px by 600px - preserves aspect ratio
 * 3. `small` - 235px by 235px - crops to square - creates png version
 * 4. `thumbnail` - 100px by 100px - crops to square - creates png version
 */
const imgTransforms = [
  { name: "image", transform: { size: 1600, mod: "max", format: "jpg" } },
  { name: "large", transform: { size: 1000, mod: "max", format: "jpg" } },
  { name: "medium", transform: { size: 600, mod: "max", format: "jpg" } },
  { name: "small", transform: { size: 235, mod: "crop", format: "png" } },
  { name: "thumbnail", transform: { size: 100, mod: "crop", format: "png" } }
];

/**
 * @function buildGFS
 * @param {object} imgTransform
 * @summary buildGFS returns a fresh FS.Store.GridFS instance
 * from provided image transform settings.
 * `chunkSize` 1024*1024*2 is the CFS default
 * 256k is default GridFS `chunkSize`, but performs terribly
 */
const buildGFS = (img) => {
  if (Meteor.isServer) Promise.await(lazyLoadSharp()); // eslint-disable-line no-undef
  return new FS.Store.GridFS(img.name, {
    chunkSize: 1 * 1024 * 1024,
    transformWrite(fileObj, readStream, writeStream) {
      if (sharp && img.transform) { // if sharp is loaded and the img has a transform
        const { size, mod, format } = img.transform;
        const transform = sharp().resize(size, size)[mod]().toFormat(format); // resizing image, adding mod, setting output format
        readStream.pipe(transform).pipe(writeStream); // applying transform to file
      } else {
        readStream.pipe(writeStream);
      }
    }
  });
};

/**
 * @name stores
 * @constant {Array}
 * @summary Defines an array of FS.Store.GridFS by mapping
 * the imgTransform settings over the buildGFS function
 */
const stores = imgTransforms.map(buildGFS);

/**
 * @name Media
 * @memberof FS.Collection
 * @type FS.Collection
 * @summary Defines {@link https://github.com/CollectionFS/Meteor-CollectionFS|CollectionFS} collection configuration
 * To learn how to further manipulate images with Sharp, refer to the
 * {@link http://sharp.pixelplumbing.com/en/stable/|Sharp Docs} and the
 * @see https://github.com/CollectionFS/Meteor-CollectionFS
 */
export const Media = new FS.Collection("Media", {
  stores,
  filter: {
    allow: {
      contentTypes: ["image/*"]
    }
  }
});
