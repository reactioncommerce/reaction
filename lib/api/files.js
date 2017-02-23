/*
 * Copy store data, copied from Meteor CollectionsFS
 * https://github.com/CollectionFS/Meteor-CollectionFS/blob/master/packages/file/fsFile-server.js#L225
 */
function _copyStoreData(fileObj, storeName, sourceKey, callback) {
  if (!fileObj.isMounted()) {
    throw new Error("Cannot copy store data for a file that is not associated with a collection");
  }

  const storage = fileObj.collection.storesLookup[storeName];
  if (!storage) {
    throw new Error(storeName + " is not a valid store name");
  }

  // We want to prevent beforeWrite and transformWrite from running, so
  // we interact directly with the store.
  const destinationKey = storage.adapter.fileKey(fileObj);
  const readStream = storage.adapter.createReadStreamForFileKey(sourceKey);
  const writeStream = storage.adapter.createWriteStreamForFileKey(destinationKey);

  writeStream.once("stored", function (result) {
    callback(null, result.fileKey);
  });

  writeStream.once("error", function (error) {
    callback(error);
  });

  readStream.pipe(writeStream);
}
const copyStoreData = Meteor.wrapAsync(_copyStoreData);

/*
 * Modified from Meteor CollectionsFS
 * https://github.com/CollectionFS/Meteor-CollectionFS/blob/master/packages/file/fsFile-server.js#L126
 */
export function copyFile(fileObj, newMetaData) {
  const self = fileObj;

  if (!self.isMounted()) {
    throw new Error("Cannot copy a file that is not associated with a collection");
  }

  // Get the file record
  const fileRecord = self.collection.files.findOne({ _id: self._id }, { transform: null }) || {};

  if (newMetaData) {
    const oldMetaData = fileRecord.metadata || {};

    fileRecord.metadata = {
      ...oldMetaData,
      ...newMetaData
    };
  }

  // Remove _id and copy keys from the file record
  delete fileRecord._id;

  // Insert directly; we don't have access to "original" in this case
  const newId = self.collection.files.direct.insert(fileRecord);

  const newFile = self.collection.findOne(newId);

  // Copy underlying files in the stores
  let mod;
  let oldKey;
  for (const name in newFile.copies) {
    if (newFile.copies.hasOwnProperty(name)) {
      oldKey = newFile.copies[name].key;
      if (oldKey) {
        // We need to ask the adapter for the true oldKey because
        // right now gridfs does some extra stuff.
        // TODO GridFS should probably set the full key object
        // (with _id and filename) into `copies.key`
        // so that copies.key can be passed directly to
        // createReadStreamForFileKey
        const sourceFileStorage = self.collection.storesLookup[name];
        if (!sourceFileStorage) {
          throw new Error(name + " is not a valid store name");
        }
        oldKey = sourceFileStorage.adapter.fileKey(self);
        // delete so that new fileKey will be generated in copyStoreData
        delete newFile.copies[name].key;
        mod = mod || {};
        mod["copies." + name + ".key"] = copyStoreData(newFile, name, oldKey);
      }
    }
  }
  // Update keys in the filerecord
  if (mod) {
    self.collection.files.direct.update({
      _id: newId
    }, {
      $set: mod
    });
  }

  return newFile;
}
