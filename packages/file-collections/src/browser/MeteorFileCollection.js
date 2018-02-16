import FileCollection from "../common/FileCollection";

export default class MeteorFileCollection extends FileCollection {
  constructor(name, options) {
    const { collection, DDP, ...opts } = options;

    super(name, opts);

    if (!collection) throw new Error(`MeteorFileCollection "${name}": You must pass the "collection" option`);
    if (!DDP) throw new Error(`MeteorFileCollection "${name}": You must pass the "DDP" option`);

    this.DDP = DDP;
    this.mongoCollection = collection;
  }

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

  _findOne() {
    throw new Error("MeteorFileCollection does not support findOne in browser code. Use findOneLocal");
  }

  _find() {
    throw new Error("MeteorFileCollection does not support find in browser code. Use findLocal");
  }

  _findOneLocal(id, options) {
    return this.mongoCollection.findOne({ _id: id }, options || {});
  }

  _findLocal(selector, options) {
    return this.mongoCollection.find(selector || {}, options || {});
  }
}
