/**
 * @file Exposes the ReactionImport object implementing methods for bulk imports.
 * @author Tom De Caluwé
 */

if (!MongoInternals.NpmModule.Collection.prototype.initializeUnorderedBulkOp) {
  throw Error("Couldn't detect the MongoDB bulk API, are you using MongoDB 2.6 or above?");
}

ReactionImport = class {};

ReactionFixture = Object.create(ReactionImport);

ReactionImport._buffers = {};
ReactionImport._contexts = {};
ReactionImport._count = {};
ReactionImport._indications = {};
ReactionImport._limit = 1000;

ReactionImport._name = function (collection) {
  return collection._name;
};

ReactionImport._upsert = function () {
  return true;
};

ReactionFixture._upsert = function () {
  return false;
};

ReactionImport.fixture = function () {
  return ReactionFixture;
};

ReactionImport.startup = function () {
  return true;
};

ReactionImport.load = function (key, object) {
  check(object, Object);

  let collection = this.identify(object);
  this.object(collection, key, object);
};

ReactionImport.indication = function (field, collection, probability) {
  check(field, String);
  check(collection, Mongo.Collection);
  check(probability, Number);

  this._indications[field] = {
    collection: collection,
    probability: probability
  };
};

/**
 * ReactionImport.identify
 * @summary Tries to identify the schema associated with a document.
 * @param {Object} document - A document with unknown schema
 * @returns {Mongo.Collection} Returns a MongoDB collection in which the
 * document can be inserted.
 * @throws {Error} Throws an error if the schema couldn't be determined.
 *
 * The algorithm initially assumes the document can be anything. It associates
 * with each field in the document a probability that it isn't following some
 * schema other than the one the field is associated with.
 *
 * Afterwards the schema with the maximal probability is selected. An error is
 * thrown if the schema cannot be determined.
 */
ReactionImport.identify = function (document) {
  check(document, Object);

  let probabilities = {};

  for (key of Object.keys(document)) {
    if (this._indications[key]) {
      let collection = this._name(this._indications[key].collection);
      probabilities[collection] = probabilities[collection] || 1.0 * this._indications[
        key].probability;
    }
  }

  let total = 1.0;
  for (key of Object.keys(probabilities)) {
    total *= probabilities[key];
  }

  let max = 0.0;
  let name;
  for (key of Object.keys(probabilities)) {
    let probability = total / probabilities[key];
    if (probability > max) {
      max = probability;
      name = key;
    } else if (probability === max) {
      name = undefined;
    }
  }

  if (name && max > 0.3) {
    return ReactionCore.Collections[name];
  }
  throw new Error(
    "Couldn't determine the schema associated with this document");
};

/**
 * @summary Commit the buffer for a given collection to the database.
 * @param {Mongo.Collection} collection The target collection to be flushed to disk
 * @returns {undefined}
 */
ReactionImport.flush = function (collection) {
  check(collection, Match.Optional(Mongo.Collection));

  if (!collection) {
    for (let name of Object.keys(this._buffers)) {
      this.flush(ReactionCore.Collections[name]);
    }
    return;
  }

  // Construct a collection identifier.
  let name = this._name(collection);

  // Only commit if the buffer isn't empty (otherwise it'll throw).
  if (this._count[name]) {
    this.buffer(collection).execute(function (error, result) {
      // Inserted document counts don't affect the modified document count, so we
      // throw everythin together.
      let nImported = result.nModified + result.nInserted + result.nUpserted;
      let nTouched = result.nMatched + result.nInserted + result.nUpserted;
      let nRemoved = result.nRemoved;
      // Log some information about the import.
      if (nTouched) {
        let message = "";
        message += "Modified " + nImported + (nImported === 1 ?
          " document" : " documents");
        message += " while importing " + nTouched + " to " + name;
        ReactionCore.Log.info(message);
      }
      if (nRemoved) {
        let message = "";
        message += "Removed " + nRemoved + (nRemoved === 1 ? " document" :
          " documents");
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
    delete this._buffers[name];
    this._count[name] = 0;
  }
};

/**
 * @summary Get a validation context for a given collection.
 * @param {Mongo.Collection} collection The target collection
 * @returns {SimpleSchemaValidationContext} A validation context.
 *
 * The validation context is requested from the schema associated with the
 * collection.
 */
ReactionImport.context = function (collection) {
  check(collection, Mongo.Collection);

  // Construct a context identifier.
  let name = this._name(collection);

  // Construct a new validation context if necessary.
  if (this._contexts[name]) {
    return this._contexts[name];
  }
  this._contexts[name] = collection.simpleSchema().newContext();
  return this._contexts[name];
};

/**
 * @summary Get an import buffer for a given collection.
 * @param {Object} collection The target collection
 * @returns {Object} return buffer
 * If no buffer is presented, a new one will be constructed.
 */
ReactionImport.buffer = function (collection) {
  check(collection, Mongo.Collection);

  // Construct a buffer identifier.
  let name = this._name(collection);

  // Construct a new buffer if necessary.
  if (this._buffers[name]) {
    return this._buffers[name];
  }
  this._count[name] = 0;
  this._buffers[name] = collection.rawCollection().initializeUnorderedBulkOp();
  return this._buffers[name];
};

/**
 * @summary Store a product in the import buffer.
 * @param {Object} key A key to look up the product
 * @param {Object} product The product data to be updated
 * @param {Object} parent A key to identify the parent product
 * @returns {Object}
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
    this.buffer(collection).find({
      variants: {
        $elemMatch: key
      },
      $nor: [parent]
    }).update({
      $pull: {
        variants: {
          $elemMatch: key
        }
      }
    });
    // Make sure the variant exists.
    query = {
      $nor: [{
        variants: {
          $elemMatch: key
        }
      }]
    };
    for (let okey of Object.keys(parent)) {
      query[okey] = parent[okey];
    }
    this.buffer(collection).find(query).update({
      $push: {
        variants: key
      }
    });
    // Upsert the variant.
    ReactionCore.Schemas.ProductVariant.clean(product, {});
    query = {
      variants: {
        $elemMatch: key
      }
    };

    for (let okey of Object.keys(parent)) {
      query[okey] = parent[okey];
    }
    update = {};
    for (let okey of Object.keys(product)) {
      update["variants.$." + okey] = product[okey];
    }
    this.context(collection).validate(update, {});
    this.buffer(collection).find(query).update({
      $set: update
    });
  } else {
    return this.object(ReactionCore.Collections.Products, key, product);
  }
};

/**
 * @summary Store a package in the import buffer.
 * @param {Object} pkg The package data to be updated
 * @param {String} shopId The package data to be updated
 * @returns {undefined}
 */
ReactionImport.package = function (pkg, shopId) {
  check(pkg, Object);
  check(shopId, String);
  const key = {name: pkg.name, shopId: shopId};
  return this.object(ReactionCore.Collections.Packages, key, pkg);
};

/**
 * @summary Store a translation in the import buffer.
 * @param {Object} key A key to look up the translation
 * @param {Object} translation The translation data to be updated
 * @returns {Object} updated translation buffer
 */
ReactionImport.translation = function (key, translation) {
  return this.object(ReactionCore.Collections.Translations, key, translation);
};

/**
 * @summary Store a shop in the import buffer.
 * @param {Object} key A key to look up the shop
 * @param {Object} shop The shop data to be updated
 * @returns {Object} this shop
 */
ReactionImport.shop = function (key, shop) {
  let json;

  shop.languages = shop.languages || [{
    i18n: "en"
  }];
  for (let language of shop.languages) {
    json = Assets.getText("private/data/i18n/" + language.i18n + ".json");
    this.process(json, ["i18n"], ReactionImport.translation);
  }
  return this.object(ReactionCore.Collections.Shops, key, shop);
};

/**
 * @summary Store shipping in the import buffer.
 * @param {Object} key A key to look up the tag
 * @param {Object} shipping The shipping data to be updated
 * @returns {Object} this shipping
 */
ReactionImport.shipping = function (key, shipping) {
  return this.object(ReactionCore.Collections.Shipping, key, shipping);
};

/**
 * @summary Store a tag in the import buffer.
 * @param {Object} key A key to look up the tag
 * @param {Object} tag The tag data to be updated
 * @returns {Object} this tag
 */
ReactionImport.tag = function (key, tag) {
  return this.object(ReactionCore.Collections.Tags, key, tag);
};

/**
 * @summary Push a new upsert document to the import buffer.
 * @param {Mongo.Collection} collection The target collection
 * @param {Object} key A key to look up the object
 * @param {Object} object The object data to be updated
 * @returns {undefined}
 */
ReactionImport.object = function (collection, key, object) {
  check(collection, Mongo.Collection);
  check(key, Object);
  check(object, Object);
  // enforce strings instead of Mongo.ObjectId
  if (!collection.findOne(key) && !object._id) key._id = Random.id();
  // Clean and validate the object.
  collection.simpleSchema().clean(object);
  this.context(collection).validate(object, {});
  // Upsert the object.
  let find = this.buffer(collection).find(key);
  if (this._upsert()) {
    find.upsert().update({
      $set: object
    });
  } else {
    find.upsert().update({
      $setOnInsert: object
    });
  }
  if (this._count[this._name(collection)]++ >= this._limit) {
    this.flush(collection);
  }
};

/**
 * @summary Process a json array of import documents using a callback.
 * @param {Object[]} json An array containing the import documents
 * @param {string[]} keys Fields that should be used as the import key.
 * @param {Function} callback A callback accepting two parameters.
 *{}
 * The callback should accept a key document to consult the database as a first
 * parameter and an update document as the second parameter.
 * @returns {undefined}
 */
ReactionImport.process = function (json, keys, callback) {
  check(json, String);
  check(keys, Array);
  check(callback, Function);

  let array = EJSON.parse(json);

  for (let i = 0; i < array.length; i++) {
    let key = {};
    for (let j = 0; j < keys.length; j++) {
      key[keys[j]] = array[i][keys[j]];
    }
    callback.call(this, key, array[i]);
  }
};

ReactionImport.indication("i18n", ReactionCore.Collections.Translations, 0.2);
ReactionImport.indication("hashtags", ReactionCore.Collections.Products, 0.5);
ReactionImport.indication("variants", ReactionCore.Collections.Products, 0.5);
ReactionImport.indication("languages", ReactionCore.Collections.Shops, 0.5);
ReactionImport.indication("currencies", ReactionCore.Collections.Shops, 0.5);
ReactionImport.indication("timezone", ReactionCore.Collections.Shops, 0.5);
ReactionImport.indication("isTopLevel", ReactionCore.Collections.Tags, 0.4);
ReactionImport.indication("slug", ReactionCore.Collections.Tags, 0.5);
