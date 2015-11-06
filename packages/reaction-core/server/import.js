/**
 * @file Exposes the ReactionImport object implementing methods for bulk imports.
 * @author Tom De Caluwé
 */

ReactionImport = {};

ReactionImport._buffers = {};
ReactionImport._contexts = {};
ReactionImport._count = {};
ReactionImport._limit = 1000;

ReactionImport._name = function(collection) {
  return collection._name;
}

/**
 * @summary Commit the buffer for a given collection to the database.
 * @param {Object} collection The target collection to be flushed to disk
 */
ReactionImport.flush = function (collection) {
  check(collection, Mongo.Collection);

  // Construct a context identifier.
  let name = ReactionImport._name(collection);

  // Only commit if the buffer isn't empty (otherwise it'll throw).
  if (ReactionImport._count[name]) {
    ReactionImport.buffer(collection).execute(function(error, result) {
      // Inserted document counts don't affect the modified document count, so we
      // throw everythin together.
      let nImported = result.nModified + result.nInserted + result.nUpserted;
      let nTouched = result.nMatched + result.nInserted + result.nUpserted;
      let nRemoved = result.nRemoved;
      // Log some information about the import.
      {//if (nImported) {
        let message = "";
        message += "Modified " + nImported + (nImported === 1 ? " document" : " documents");
        message += " while importing " + nTouched + " to " + name;
        ReactionCore.Log.info(message);
      }
      if (nRemoved) {
        let message = "";
        message += "Removed " + nRemoved + (nRemoved === 1 ? " document" : " documents");
        message += " from " + name;
        ReactionCore.Log.info(message);
      }
      // Log any errors returned.
      let message = "";
      message += "Error while importing to " + name;
      let writeErrors = result.getWriteErrors();
      for (let i = 0; i < writeErrors.length; i++) {
        ReactionCore.Log.warn(message + ": " + writeErrors[i].errmsg);
      }
      let writeConcernError = result.getWriteConcernError();
      if (writeConcernError) {
        ReactionCore.Log.warn(message + ": " + writeConcernError.errmsg);
      }
    });
    // Reset the buffer.
    ReactionImport._buffers[name] = collection.rawCollection().initializeUnorderedBulkOp();
    ReactionImport._count[name] = 0;
  }
}

/**
 * @summary Get a validation context for a given collection.
 * @param {Object} collection The target collection
 *
 * The validation context is requested from the schema associated with the
 * collection.
 */
ReactionImport.context = function (collection) {
  check(collection, Mongo.Collection);

  // Construct a context identifier.
  let name = ReactionImport._name(collection);

  // Construct a new validation context if necessary.
  if (ReactionImport._contexts[name]) {
    return ReactionImport._contexts[name];
  } else {
    return ReactionImport._contexts[name] = collection.simpleSchema().newContext();
  }
}

/**
 * @summary Get an import buffer for a given collection.
 * @param {Object} collection The target collection
 *
 * If no buffer is presented, a new one will be constructed.
 */
ReactionImport.buffer = function(collection) {
  check(collection, Mongo.Collection);

  // Construct a buffer identifier.
  let name = ReactionImport._name(collection);

  // Construct a new buffer if necessary.
  if (ReactionImport._buffers[name]) {
    return ReactionImport._buffers[name];
  } else {
    ReactionImport._count[name] = 0;
    return ReactionImport._buffers[name] = collection.rawCollection().initializeUnorderedBulkOp();
  }
}

/**
 * @summary Store a product in the import buffer.
 * @param {Object} key A key to look up the product
 * @param {Object} product The product data to be updated
 * @param {Object} parent A key to identify the parent product
 * 
 * Importing a variant currently consists of the following steps:
 *
 * * Pull the variant from non-matching parent products.
 * * Push the variant if it doesn't exist.
 * * Update the variant.
 */
ReactionImport.product = function (key, product, parent) {
  let collection = ReactionCore.Collections.Products;

  if (parent) {
    ReactionCore.Schemas.ProductVariant.clean(product, {});
    // Remove variants with the same key from other parents.
    ReactionImport.buffer(collection).find({
      'variants': { $elemMatch: key },
      $nor: [ parent ]
    }).update({ $pull: { 'variants': { $elemMatch: key } } });
    // Make sure the variant exists.
    query = { $nor: [ { 'variants': { $elemMatch: key } } ] };
    for (let key of Object.keys(parent)) {
      query[key] = parent[key];
    }
    ReactionImport.buffer(collection).find(query).update({ $push: { 'variants': key } });
    // Upsert the variant.
    ReactionCore.Schemas.ProductVariant.clean(product, {});
    query = { 'variants': { $elemMatch: key } };
    for (let key of Object.keys(parent)) {
      query[key] = parent[key];
    }
    update = {};
    for (let key of Object.keys(product)) {
      update['variants.$.' + key] = product[key];
    }
    ReactionImport.context(collection).validate(update, {});
    ReactionImport.buffer(collection).find(query).update({ $set: update });
  } else {
    return ReactionImport.object(ReactionCore.Collections.Products, key, product);
  }
}

/**
 * @summary Store a shop in the import buffer.
 * @param {Object} key A key to look up the shop
 * @param {Object} tag The shop data to be updated
 */
ReactionImport.shop = function (key, shop) {
  shop._id = shop._id ? shop._id : ReactionCore.shopAutoValueId();
  return ReactionImport.object(key, shop, ReactionCore.Collections.Shops);
}

/**
 * @summary Store a tag in the import buffer.
 * @param {Object} key A key to look up the tag
 * @param {Object} tag The tag data to be updated
 */
ReactionImport.tag = function (key, tag) {
  ReactionCore.Collections.Tags.before.update(Meteor.userId(), object);
  return ReactionImport.object(key, tag, ReactionCore.Collections.Tags);
}

/**
 * @summary Push a new object to the import buffer associated with a collection.
 * @param {Object} collection The target collection
 * @param {Object} key A key to look up the object
 * @param {Object} object The object data to be updated
 */
ReactionImport.object = function (collection, key, object) {
  check(collection, Mongo.Collection);

  // Clean and validate the object.
  collection.simpleSchema().clean(object);
  ReactionImport.context(collection).validate(object, {});
  // Upsert the object.
  ReactionImport.buffer(collection).find(key).upsert().update({
    $set: object
  });
  if (ReactionImport._count[ReactionImport._name(collection)]++ >= ReactionImport._limit) {
    ReactionImport.flush(collection);
  }
}

/**
 * @summary Process a json array of import documents using a callback.
 * @param {Object[]} json An array containing the import documents
 * @param {string[]} keys Fields that should be used as the import key.
 * @param {Function} callback A callback accepting two parameters.
 *
 * The callback should accept a key document to consult the database as a first
 * parameter and an update document as the second parameter.
 */
ReactionImport.process = function (json, keys, callback) {
  check(json, Array);
  check(keys, Array);
  check(callback, Function);

  for (let i = 0; i < json.length; i++) {
    let key = {};
    for (let j = 0; j < keys.length; j++) {
      key[keys[j]] = json[i][keys[j]];
    }
    callback(key, json[i]);
  }
}
