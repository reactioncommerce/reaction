import FileCollection from "../common/FileCollection";

/**
 * A type of FileCollection that uses a Mongo Collection as its backing storage
 */
export default class MongoFileCollection extends FileCollection {
  /**
   * @constructor MongoFileCollection
   * @param {String} name The name you want to use to refer to the FileCollection
   * @param {Object} options options
   * @param {Collection} options.collection The collection to use. Call db.collection(name) from the
   *   Mongo NPM package to get this reference.
   *
   * Additional options documented in FileCollection class
   */
  constructor(name, options = {}) {
    const { collection, makeNewStringID, ...opts } = options;

    super(name, opts);

    if (!collection) throw new Error(`MongoFileCollection "${name}": You must pass the "collection" option`);
    if (typeof makeNewStringID !== "function") throw new Error(`MongoFileCollection "${name}": You must pass a function for the "makeNewStringID" option`);

    this.collection = collection;
    this.makeNewStringID = makeNewStringID;
  }

  /**
   * @method _insert
   * @param {Object} doc An object to be inserted.
   * @returns {Promise<Object>} A Promise that resolves with the inserted object.
   */
  async _insert(doc) {
    // Generate string ID to avoid getting a Mongo ObjectID
    if (!doc._id) doc._id = this.makeNewStringID();
    await this.collection.insert(doc);
    return this._findOne(doc._id);
  }

  /**
   * @method _update
   * @param {String} id A FileRecord ID
   * @param {Object} modifier An object to be used as the update modifier.
   * @param {Object} options options for update
   * @returns {Promise<Object>} A Promise that resolves with the updated object.
   */
  async _update(id, modifier, options) {
    await this.collection.update({ _id: id }, modifier, options);
    return this._findOne(id);
  }

  /**
   * @method _remove
   * @param {String} id A FileRecord ID
   * @param {Object} [options] options for remove
   * @returns {Promise<Number>} A Promise that resolves with 1 if success.
   */
  async _remove(id, options) {
    await this.collection.remove({ _id: id }, options);
    return 1;
  }

  /**
   * @method _findOne
   * @param {String|Object} selector A FileRecord ID or MongoDB Selector
   * @param {Object} options Options object to be passed through to Mongo's findOne
   * @returns {Promise<Object|undefined>} A Promise that resolves with the document or undefined
   */
  async _findOne(selector, options) {
    const finalSelector = typeof selector === "string" ? { _id: selector } : selector;
    return this.collection.findOne(finalSelector, options);
  }

  /**
   * @method _find
   * @param {Object|String} selector A FileRecord ID or MongoDB selector
   * @param {Object} options Options object to be passed through to Mongo's findOne
   * @returns {Promise<Object[]>} A Promise that resolves with a potentially-empty array of documents
   */
  async _find(selector, options) {
    const finalSelector = typeof selector === "string" ? { _id: selector } : selector;
    return this.collection.find(finalSelector || {}, options || {}).toArray();
  }

  _findOneLocal() {
    throw new Error("MongoFileCollection does not support findOneLocal in Node code. Use findOne");
  }

  _findLocal() {
    throw new Error("MongoFileCollection does not support findLocal in Node code. Use find");
  }
}
