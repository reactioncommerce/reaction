import applyBeforeAfterToFilter from "./applyBeforeAfterToFilter";
import applyPaginationToMongoCursor from "./applyPaginationToMongoCursor";
import getCollectionFromCursor from "./getCollectionFromCursor";
import getMongoSort from "./getMongoSort";

const getPaginatedResponse = async (query, args) => {
  const totalCount = await query.clone().count();
  const collection = getCollectionFromCursor(query);

  const baseFilter = query.cmd.query;
  const updatedFilter = await applyBeforeAfterToFilter({ collection, baseFilter, ...args });
  const sort = getMongoSort(args);

  query.filter(updatedFilter).sort(sort);

  const { pageInfo } = await applyPaginationToMongoCursor(query, args, totalCount);
  const nodes = await query.toArray();
  const count = nodes.length;

  if (count) {
    pageInfo.startCursor = nodes[0]._id;
    pageInfo.endCursor = nodes[count - 1]._id;
  }

  return { nodes, pageInfo, totalCount };
};

export default getPaginatedResponse;
