import FileCollection from "../common/FileCollection";

/**
 * A type of FileCollection that uses a Meteor Mongo.Collection as its
 * backing storage and uses Meteor DDP to send browser ops to the server.
 */
export default class MeteorFileCollection extends FileCollection {
  /**
   * @constructor MeteorFileCollection
   * @param {String} name The name you want to use to refer to the FileCollection.
   *   Be sure to use the same name in Node and browser code so that they can
   *   communicate over DDP.
   * @param {Object} options options for collection
   * @param {Mongo.Collection} options.collection The collection to use
   * @param {DDPConnection} options.DDP The DDP connection to use
   *
   * Additional options documented in FileCollection class
   */
  constructor(name, options) {
    const { collection, DDP, ...opts } = options;

    super(name, opts);

    if (!collection) throw new Error(`MeteorFileCollection "${name}": You must pass the "collection" option`);
    if (!DDP) throw new Error(`MeteorFileCollection "${name}": You must pass the "DDP" option`);

    this.DDP = DDP;
    this.mongoCollection = collection;
  }

  /**
   * @method _insert
   * @param {Object} doc An object to be sent to the server over DDP to be inserted.
   * @returns {Promise<Object>} A Promise that resolves with the inserted object.
   */
  _insert(doc) {
    return new Promise((resolve, reject) => {
      this.DDP.call(`FileCollection/INSERT/${this.name}`, { doc }, (error, insertedDoc) => {
        if (error) {
          reject(error);
        } else {
          resolve(insertedDoc);
        }
      });
    });
  }

  /**
   * @method _update
   * @param {String} id A FileRecord ID
   * @param {Object} modifier An object to be sent to the server over DDP to be used as the update modifier.
   * @returns {Promise<Object>} A Promise that resolves with the updated object.
   */
  _update(id, modifier) {
    return new Promise((resolve, reject) => {
      this.DDP.call(`FileCollection/UPDATE/${this.name}`, { _id: id, modifier }, (error, updatedDoc) => {
        if (error) {
          reject(error);
        } else {
          resolve(updatedDoc);
        }
      });
    });
  }

  /**
   * @method _remove
   * @param {String} id A FileRecord ID
   * @returns {Promise<Number>} A Promise that resolves with 1 if success
   */
  _remove(id) {
    return new Promise((resolve, reject) => {
      this.DDP.call(`FileCollection/REMOVE/${this.name}`, { _id: id }, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  /**
   * @method _findOne
   * @param {Object|String} id A FileRecord ID or MongoDB selector
   * @param {Object} options Options object to be passed through to Meteor's findOne
   * @returns {Promise<Object|undefined>} A Promise that resolves with the document or undefined
   */
  async _findOne(...args) {
    return this._findOneLocal(...args);
  }

  /**
   * @method _find
   * @param {Object|String} selector A FileRecord ID or MongoDB selector
   * @param {Object} options Options object to be passed through to Meteor's findOne
   * @returns {Promise<Cursor>} A Promise that resolves with the Meteor find cursor
   */
  async _find(...args) {
    return this._findLocal(...args);
  }

  /**
   * @method _findOneLocal
   * @param {Object|String} selector A FileRecord ID or MongoDB selector
   * @param {Object} options Options object to be passed through to Meteor's findOne
   * @returns {Object|undefined} The document or undefined
   */
  _findOneLocal(selector, options) {
    return this.mongoCollection.findOne(selector || {}, options || {});
  }

  /**
   * @method _findLocal
   * @param {Object|String} selector A FileRecord ID or MongoDB selector
   * @param {Object} options Options object to be passed through to Meteor's findOne
   * @returns {Cursor} The Meteor find cursor
   */
  _findLocal(selector, options) {
    return this.mongoCollection.find(selector || {}, options || {});
  }
}
