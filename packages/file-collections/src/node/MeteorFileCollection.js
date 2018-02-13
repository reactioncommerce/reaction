import util from "util"; // Built-in Node package
import FileCollection from "../common/FileCollection";

export default class MeteorFileCollection extends FileCollection {
  constructor(name, options) {
    const { check, collection, DDP, ...opts } = options;

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
        return self._insert(doc);
      },
      [`FileCollection/UPDATE/${name}`](data) {
        check && check(data, {
          _id: String,
          modifier: Object
        });
        const { _id, modifier } = data;
        return self._update(_id, modifier);
      },
      [`FileCollection/REMOVE/${name}`](data) {
        check && check(data, {
          _id: String
        });
        const { _id } = data;
        return self._remove(_id);
      }
    });
  }

  async _insert(doc) {
    // Generate string ID to avoid getting a Mongo ObjectID
    if (!doc._id) doc._id = this.mongoCollection._makeNewID();
    const id = await this.insertPromise(doc);
    return this._findOne(id);
  }

  async _update(id, modifier, options) {
    await this.updatePromise({ _id: id }, modifier, options);
    return this._findOne(id);
  }

  async _remove(id, options) {
    await this.removePromise({ _id: id }, options);
    return 1;
  }

  _findOne(id, options) {
    return new Promise((resolve, reject) => {
      let doc;
      try {
        doc = this.mongoCollection.findOne({ _id: id }, options);
      } catch (error) {
        reject(error);
        return;
      }

      resolve(doc);
    });
  }

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
    throw new Error("findOneLocal not supported in Node variation");
  }

  _findLocal() {
    throw new Error("findOneLocal not supported in Node variation");
  }
}
