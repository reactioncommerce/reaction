import util from "util"; // Built-in Node package
import FileCollection from "../common/FileCollection";

export default class MeteorFileCollection extends FileCollection {
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
    throw new Error("MeteorFileCollection does not support findOneLocal in Node code. Use findOne");
  }

  _findLocal() {
    throw new Error("MeteorFileCollection does not support findLocal in Node code. Use find");
  }
}
