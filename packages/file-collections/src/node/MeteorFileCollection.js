import util from "util"; // Built-in Node package
import FileCollection from "../common/FileCollection";

/**
 * A type of FileCollection that uses a Meteor Mongo.Collection as its
 * backing storage and uses Meteor DDP to get browser-initiated ops
 */
export default class MeteorFileCollection extends FileCollection {
  /**
   * @constructor MeteorFileCollection
   * @param {String} name The name you want to use to refer to the FileCollection.
   *   Be sure to use the same name in Node and browser code so that they can
   *   communicate over DDP.
   * @param {Object} options options
   * @param {Function} options.allowInsert A function that should return `true` if
   *   an insert should be allowed. Receives args (userId, doc)
   * @param {Function} options.allowUpdate A function that should return `true` if
   *   an update should be allowed. Receives args (userId, id, modifier)
   * @param {Function} options.allowRemove A function that should return `true` if
   *   a remove should be allowed. Receives args (userId, id)
   * @param {Function} options.check The `check` object from Meteor
   * @param {Mongo.Collection} options.collection The collection to use
   * @param {DDPConnection} options.DDP The DDP connection to use
   *
   * Additional options documented in FileCollection class
   */
  constructor(name, options) {
    const { allowInsert, allowUpdate, allowRemove, check, collection, DDP, ...opts } = options;

    super(name, opts);

    if (!collection) throw new Error(`MeteorFileCollection "${name}": You must pass the "collection" option`);
    if (!DDP) throw new Error(`MeteorFileCollection "${name}": You must pass the "DDP" option`);

    this.DDP = DDP;
    this.mongoCollection = collection;
    this.rawCollection = collection.rawCollection();

    this.insertPromise = util.promisify(this.rawCollection.insert.bind(this.rawCollection));
    this.updatePromise = util.promisify(this.rawCollection.update.bind(this.rawCollection));
    this.removePromise = util.promisify(this.rawCollection.remove.bind(this.rawCollection));

    // Create server methods for the client version of this class to call
    const self = this;
    DDP.methods({
      [`FileCollection/INSERT/${name}`](data) {
        check && check(data, {
          doc: Object
        });
        const { doc } = data;

        if (typeof allowInsert !== "function" || !allowInsert(this.userId, doc)) {
          const error = new Error(`You are not allowed to insert to the ${name} FileCollection`);
          error.error = "forbidden";
          // Tell DDP it's OK to send this error to client. Equivalent to a `Meteor.Error`
          error.isClientSafe = true;
          throw error;
        }

        return self._insert(doc);
      },
      [`FileCollection/UPDATE/${name}`](data) {
        check && check(data, {
          _id: String,
          modifier: Object
        });
        const { _id, modifier } = data;

        if (typeof allowUpdate !== "function" || !allowUpdate(this.userId, _id, modifier)) {
          const error = new Error(`You are not allowed to update to the ${name} FileCollection`);
          error.error = "forbidden";
          // Tell DDP it's OK to send this error to client. Equivalent to a `Meteor.Error`
          error.isClientSafe = true;
          throw error;
        }

        return self._update(_id, modifier);
      },
      [`FileCollection/REMOVE/${name}`](data) {
        check && check(data, {
          _id: String
        });
        const { _id } = data;

        if (typeof allowRemove !== "function" || !allowRemove(this.userId, _id)) {
          const error = new Error(`You are not allowed to remove from the ${name} FileCollection`);
          error.error = "forbidden";
          // Tell DDP it's OK to send this error to client. Equivalent to a `Meteor.Error`
          error.isClientSafe = true;
          throw error;
        }

        return self._remove(_id);
      }
    });
  }

  /**
   * @method _insert
   * @param {Object} doc An object to be inserted.
   * @returns {Promise<Object>} A Promise that resolves with the inserted object.
   */
  async _insert(doc) {
    // Generate string ID to avoid getting a Mongo ObjectID
    if (!doc._id) doc._id = this.mongoCollection._makeNewID();
    await this.insertPromise(doc);
    return this._findOne(doc._id);
  }

  /**
   * @method _update
   * @param {String} id A FileRecord ID
   * @param {Object} modifier An object to be used as the update modifier.
   * @param {Object} options options
   * @returns {Promise<Object>} A Promise that resolves with the updated object.
   */
  async _update(id, modifier, options) {
    await this.updatePromise({ _id: id }, modifier, options);
    return this._findOne(id);
  }

  /**
   * @method _remove
   * @param {String} id A FileRecord ID
   * @param {Object} [options] options
   * @returns {Promise<Number>} A Promise that resolves with 1 if success.
   */
  async _remove(id, options) {
    await this.removePromise({ _id: id }, options);
    return 1;
  }

  /**
   * @method _findOne
   * @param {String|Object} selector A FileRecord ID or MongoDB Selector
   * @param {Object} options Options object to be passed through to Meteor's findOne
   * @returns {Promise<Object|undefined>} A Promise that resolves with the document or undefined
   */
  _findOne(selector, options) {
    return new Promise((resolve, reject) => {
      let doc;
      try {
        doc = this.mongoCollection.findOne(selector, options);
      } catch (error) {
        reject(error);
        return;
      }

      resolve(doc);
    });
  }

  /**
   * @method _find
   * @param {Object|String} selector A FileRecord ID or MongoDB selector
   * @param {Object} options Options object to be passed through to Meteor's findOne
   * @returns {Promise<Object[]>} A Promise that resolves with an array of file documents that match the selector
   */
  _find(selector, options) {
    return new Promise((resolve, reject) => {
      let docs;
      try {
        docs = this.mongoCollection.find(selector || {}, options || {}).fetch();
      } catch (error) {
        reject(error);
        return;
      }

      resolve(docs);
    });
  }

  _findOneLocal() {
    throw new Error("MeteorFileCollection does not support findOneLocal in Node code. Use findOne");
  }

  _findLocal() {
    throw new Error("MeteorFileCollection does not support findLocal in Node code. Use find");
  }
}
