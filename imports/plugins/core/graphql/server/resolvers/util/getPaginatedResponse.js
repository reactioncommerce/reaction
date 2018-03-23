import { curry } from "ramda";
import applyBeforeAfterToFilter from "./applyBeforeAfterToFilter";
import applyPaginationToMongoCursor from "./applyPaginationToMongoCursor";
import getCollectionFromCursor from "./getCollectionFromCursor";
import getMongoSort from "./getMongoSort";

const getPaginatedResponse = curry(async (xform, query, args) => {
  const { totalCount, pageInfo } = await applyPaginationToMongoCursor(query, args);

  const collection = getCollectionFromCursor(query);
  const baseFilter = query.cmd.query;

  const updatedFilter = await applyBeforeAfterToFilter({ collection, baseFilter, ...args });
  const sort = getMongoSort(args);

  let nodes = await query.filter(updatedFilter).sort(sort).toArray();
  if (xform) nodes = nodes.map(xform);

  const count = nodes.length;
  if (count) {
    pageInfo.startCursor = nodes[0]._id;
    pageInfo.endCursor = nodes[count - 1]._id;
  }

  return { nodes, pageInfo, totalCount };
});

export default getPaginatedResponse;
