class Collection {
  attachSchema() {}
}

export const Mongo = {
  Collection: () => new Collection()
};
