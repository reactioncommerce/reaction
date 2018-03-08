import { Mongo, MongoInternals } from "meteor/mongo";
import { EJSON } from "meteor/ejson";
import { check, Match } from "meteor/check";
import { Random } from "meteor/random";
import * as Collections from "/lib/collections";
import Hooks from "../hooks";
import { Logger } from "../logger";

/**
 * @file Exposes the Importer object implementing methods for bulk imports.
 * @author Tom De Caluwé
 * @namespace Importer
 */

export const Importer = {};

Importer._buffers = {};
Importer._contexts = {};
Importer._count = {};
Importer._indications = {};
Importer._limit = 1000;

Importer._name = function (collection) {
  return collection._name;
};

Importer._upsert = function () {
  return true;
};

//
// TODO Verify if Importer.startup is deprecated
//
Importer.startup = function () {
  return true;
};

Importer.load = function (key, object) {
  check(object, Object);

  this.object(this.identify(object), key, object);
};

Importer.indication = function (field, collection, probability) {
  check(field, String);
  check(collection, Mongo.Collection);
  check(probability, Number);

  this._indications[field] = { collection, probability };
};

/**
 * Importer.identify
 * @name identify
 * @method
 * @memberof Importer
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
Importer.identify = function (document) {
  check(document, Object);

  const probabilities = {};

  for (const key of Object.keys(document)) {
    if (this._indications[key]) {
      const collection = this._name(this._indications[key].collection);
      probabilities[collection] = probabilities[collection] || 1.0 * this._indications[
        key].probability;
    }
  }

  let total = 1.0;
  for (const key of Object.keys(probabilities)) {
    total *= probabilities[key];
  }

  let max = 0.0;
  let name;
  for (const key of Object.keys(probabilities)) {
    const probability = total / probabilities[key];
    if (probability > max) {
      max = probability;
      name = key;
    } else if (probability === max) {
      name = undefined;
    }
  }

  if (name && max > 0.3) {
    return Collections[name];
  }
  throw new Error("Couldn't determine the schema associated with this document");
};

/**
 * @name commit
 * @method
 * @memberof Importer
 * @summary Commit the buffer for a given collection to the database.
 * @param {Mongo.Collection} collection The target collection to be flushed to disk
 * @returns {undefined}
 */
Importer.commit = function (collection) {
  check(collection, Mongo.Collection);
  // Construct a collection identifier.
  const name = this._name(collection);

  // Only commit if the buffer isn't empty (otherwise it'll throw).
  if (this._count[name]) {
    this.buffer(collection).execute((error, result) => {
      // Inserted document counts don't affect the modified document count, so we
      // throw everything together.
      const nImported = result.nModified + result.nInserted + result.nUpserted;
      const nTouched = result.nMatched + result.nInserted + result.nUpserted;
      const { nRemoved } = result;
      // Log some information about the Importer.
      if (nTouched) {
        let message = `Modified ${nImported}${nImported === 1 ? " document" : " documents"}`;
        message += ` while importing ${nTouched} to ${name}`;
        Logger.debug(message);
      }
      if (nRemoved) {
        let message = `Removed ${nRemoved}${nRemoved === 1 ? " document" : " documents"}`;
        message += ` from ${name}`;
        Logger.debug(message);
      }
      // Log any errors returned.
      const message = `Error while importing to ${name}`;
      const writeErrors = result.getWriteErrors();

      for (let i = 0; i < writeErrors.length; i += 1) {
        Logger.warn(`${message}: ${writeErrors[i].errmsg}`);
      }
      const writeConcernError = result.getWriteConcernError();
      if (writeConcernError) {
        Logger.warn(`${message}: ${writeConcernError.errmsg}`);
      }
    });
    // Reset the buffer.
    delete this._buffers[name];
    this._count[name] = 0;
  }
};

/**
 * @name flush
 * @method
 * @memberof Importer
 * @summary Process the buffer for a given collection and commit the database.
 * @param {Mongo.Collection} collection optional - supply a Mongo collection, or leave empty to commit all buffer entries
 * @returns {undefined}
 */
Importer.flush = function (collection) {
  if (!collection) {
    for (const name of Object.keys(this._buffers)) {
      this.commit(Collections[name]);
    }
    return;
  }
  this.commit(collection);
};

/**
 * @name context
 * @method
 * @memberof Importer
 * @summary Get a validation context for a given collection.
 * @param {Mongo.Collection} collection The target collection
 * @param {Object} [selector] A selector object to retrieve the correct schema.
 * @returns {SimpleSchema.ValidationContext} A validation context.
 *
 * The validation context is requested from the schema associated with the
 * collection.
 */
Importer.context = function (collection, selector) {
  check(collection, Mongo.Collection);
  check(selector, Match.Optional(Object));

  // Construct a context identifier.
  let name = this._name(collection);
  if (selector && selector.type) {
    name = `${name}_${selector.type}`;
  }
  return collection.simpleSchema(selector).namedContext(name);
};

/**
 * @name buffer
 * @method
 * @memberof Importer
 * @summary Get an import buffer for a given collection.
 * @param {Object} collection The target collection
 * @returns {Object} return buffer
 * If no buffer is presented, a new one will be constructed.
 */
Importer.buffer = function (collection) {
  check(collection, Mongo.Collection);

  if (!MongoInternals.NpmModule.Collection.prototype.initializeUnorderedBulkOp) {
    throw Error("Couldn't detect the MongoDB bulk API, are you using MongoDB 2.6 or above?");
  }

  // Construct a buffer identifier.
  const name = this._name(collection);

  // Construct a new buffer if necessary.
  if (this._buffers[name]) {
    return this._buffers[name];
  }
  this._count[name] = 0;
  this._buffers[name] = collection.rawCollection().initializeUnorderedBulkOp();
  return this._buffers[name];
};

/**
 * @name product
 * @method
 * @memberof Importer
 * @summary Store a product in the import buffer.
 * @param {Object} key A key to look up the product
 * @param {Object} product The product data to be updated
 * @returns {Object}
 * Importing a variant currently consists of the following steps:
 *
 * * Pull the variant from non-matching parent products.
 * * Push the variant if it doesn't exist.
 * * Update the variant.
 */
Importer.product = function (key, product) {
  // If product has an _id, we use it to look up the product before
  // updating the product so as to avoid trying to change the _id
  // which is immutable.
  if (product._id && !key._id) {
    key._id = product._id;
  }
  return this.object(Collections.Products, key, product);
};

/**
 * @name package
 * @method
 * @memberof Importer
 * @summary Store a package in the import buffer.
 * @param {Object} pkg The package data to be updated
 * @param {String} shopId The package data to be updated
 * @returns {undefined}
 */
Importer.package = function (pkg, shopId) {
  check(pkg, Object);
  check(shopId, String);
  const key = {
    name: pkg.name,
    shopId
  };
  return this.object(Collections.Packages, key, pkg);
};

//
// Importer.translation
// server/startup/i18n.js
//

/**
 * @name template
 * @method
 * @memberof Importer
 * @summary Store a template in the import buffer.
 * @param {Object} templateInfo The template data to be updated
 * @returns {undefined}
 */
Importer.template = function (templateInfo) {
  check(templateInfo, Object);

  const key = {
    name: templateInfo.name,
    type: templateInfo.type || "template"
  };

  return this.object(Collections.Templates, key, templateInfo);
};

/**
 * @name translation
 * @method
 * @memberof Importer
 * @summary Store a translation in the import buffer.
 * @param {Object} key A key to look up the translation
 * @param {Object} translation The translation data to be updated
 * @returns {Object} updated translation buffer
 */
Importer.translation = function (key, translation) {
  const modifiedKey = Object.assign(key, { ns: translation.ns });
  return this.object(Collections.Translations, modifiedKey, translation);
};

/**
 * @name shop
 * @method
 * @memberof Importer
 * @summary Store a shop in the import buffer.
 * @param {Object} key A key to look up the shop
 * @param {Object} shop The shop data to be updated
 * @returns {Object} this shop
 */
Importer.shop = function (key, shop) {
  return this.object(Collections.Shops, key, shop);
};

/**
 * @name layout
 * @method
 * @memberof Importer
 * @summary store a shop layout in the import buffer
 * @param {Array} layout - an array of layouts to be added to shop
 * @param {String} shopId shopId
 * @returns {Object} this shop
 */
Importer.layout = function (layout, shopId) {
  const key = {
    _id: shopId
  };
  return this.object(Collections.Shops, key, {
    _id: shopId,
    layout
  });
};

/**
 * @name shipping
 * @method
 * @memberof Importer
 * @summary Store shipping in the import buffer.
 * @param {Object} key A shipping service key used in combination with provider
 * @param {Object} shipping The shipping data to be updated
 * @returns {Object} this shipping
 */
Importer.shipping = function (key, shipping) {
  let importKey = {};
  //
  // we have a bit of a strange structure in Shipping
  // and don't really have a key that is good for
  // determining if we imported this before
  // so we're just saying that if this service
  // already exists then we're not going to import
  //
  const result = Collections.Shipping.findOne(key);
  if (result) {
    importKey = {
      _id: result._id,
      shopId: result.shopId
    };
    delete shipping.methods;
  }
  const modifiedKey = Object.assign({}, key, importKey);
  return this.object(Collections.Shipping, modifiedKey, shipping);
};

/**
 * @name tag
 * @method
 * @memberof Importer
 * @summary Store a tag in the import buffer.
 * @param {Object} key A key to look up the tag
 * @param {Object} tag The tag data to be updated
 * @returns {Object} this tag
 */
Importer.tag = function (key, tag) {
  return this.object(Collections.Tags, key, tag);
};

/**
 * @name object
 * @method
 * @memberof Importer
 * @summary Push a new upsert document to the import buffer.
 * @param {Mongo.Collection} collection The target collection
 * @param {Object} key A key to look up the object
 * @param {Object} object The object data to be updated
 * @returns {undefined}
 */
Importer.object = function (collection, key, object) {
  check(collection, Mongo.Collection);
  check(key, Object);
  check(object, Object);

  // enforce strings instead of Mongo.ObjectId
  if (!collection.findOne(key) && !object._id) {
    key._id = Random.id();
  }

  // hooks for additional import manipulation.
  const importObject = Hooks.Events.run(`onImport${this._name(collection)}`, object);

  // Cleaning the object adds default values from schema, if value doesn't exist
  const cleanedModifier = collection.simpleSchema(importObject).clean({
    $set: importObject
  }, {
    isModifier: true,
    extendAutoValueContext: { isUpsert: true }
  });

  // And validate the object against the schema
  this.context(collection, importObject).validate(cleanedModifier, {
    modifier: true,
    upsert: true
  });

  // Upsert the object.
  // With the upsert option set to true, if no matching documents exist for the Bulk.find() condition,
  // then the update or the replacement operation performs an insert.
  // https://docs.mongodb.com/manual/reference/method/Bulk.find.upsert/
  this.buffer(collection).find(key).upsert().update(cleanedModifier);

  this._count[this._name(collection)] += 1;
  if (this._count[this._name(collection)] >= this._limit) {
    this.flush(collection);
  }
};

/**
 * @name process
 * @method
 * @memberof Importer
 * @summary Process a json array of import documents using a callback.
 * @param {Object[]} json An array containing the import documents
 * @param {string[]} keys Fields that should be used as the import key.
 * @param {Function} callback A callback accepting two parameters.
 * The callback should accept a key document to consult the database as a first
 * parameter and an update document as the second parameter.
 * @returns {undefined}
 */
Importer.process = function (json, keys, callback) {
  check(json, String);
  check(keys, Array);
  check(callback, Function);

  const array = EJSON.parse(json);

  for (let i = 0; i < array.length; i += 1) {
    const key = {};
    for (let j = 0; j < keys.length; j += 1) {
      key[keys[j]] = array[i][keys[j]];
    }
    callback.call(this, key, array[i]);
  }
};

Importer.indication("i18n", Collections.Translations, 0.2);
Importer.indication("hashtags", Collections.Products, 0.5);
Importer.indication("barcode", Collections.Products, 0.5);
Importer.indication("price", Collections.Products, 0.5);
Importer.indication("ancestors", Collections.Products, 0.5);
Importer.indication("languages", Collections.Shops, 0.5);
Importer.indication("currencies", Collections.Shops, 0.5);
Importer.indication("timezone", Collections.Shops, 0.5);
Importer.indication("isTopLevel", Collections.Tags, 0.4);
Importer.indication("slug", Collections.Tags, 0.5);
Importer.indication("provider", Collections.Shipping, 0.2);

//
// exporting Fixture
// use this instead of Import if you want
// Bulk.find.upsert() to equal false
//
export const Fixture = Object.assign({}, Importer, {
  _upsert: () => false
});
