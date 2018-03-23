const sortOrderEnumToMongo = {
  asc: 1,
  desc: -1
};

export default function getMongoSort({ sortBy, sortOrder } = {}) {
  const mongoSort = sortOrderEnumToMongo[sortOrder || "asc"];
  const sortList = [["_id", mongoSort]];
  if (sortBy && sortBy !== "_id") {
    sortList.unshift([sortBy, mongoSort]);
  }
  return sortList;
}
