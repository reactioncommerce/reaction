import { curry } from "ramda";
import { decodeOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/id";
import applyPaginationToMongoQuery from "./applyPaginationToMongoQuery";

async function applyBeforeAfterToFilter({ after, baseFilter, before, collection, sortBy: sortByField, sortOrder }) {
  let filter = baseFilter;
  const limits = {};
  const ors = [];

  if (after && before) throw new Error("Including both 'after' and 'before' params is not allowed");

  if (!after && !before) return filter;

  let encodedId;
  let op;
  if (before) {
    encodedId = before;
    op = (sortOrder === "desc" ? "$gt" : "$lt");
  } else {
    encodedId = after;
    op = (sortOrder === "desc" ? "$lt" : "$gt");
  }

  // "encodedId" is encoded twice. At this point the cursor has already been decoded
  // but we are still left with an encoded ID, which we'll now decode.
  const internalId = decodeOpaqueId(encodedId).id;

  if (sortByField === "_id") {
    // We already have _id. Skip the lookup
    filter = {
      $and: [
        { ...filter },
        { _id: { [op]: internalId } }
      ]
    };
  } else {
    const doc = await collection.findOne({
      _id: internalId
    }, {
      fields: {
        [sortByField]: 1
      }
    });

    if (doc) {
      limits[op] = doc[sortByField];
      ors.push({
        [sortByField]: doc[sortByField],
        _id: { [op]: internalId }
      });

      filter = {
        $and: [
          { ...filter },
          {
            $or: [
              {
                [sortByField]: limits
              },
              ...ors
            ]
          }
        ]
      };
    }
  }

  return filter;
}

const sortOrderEnumToMongo = {
  asc: 1,
  desc: -1
};

function getMongoSort({ sortBy, sortOrder }) {
  const mongoSort = sortOrderEnumToMongo[sortOrder || "asc"];
  const sortList = [["_id", mongoSort]];
  if (sortBy && sortBy !== "_id") {
    sortList.unshift([sortBy, mongoSort]);
  }
  return sortList;
}

function getCollectionFromCursor(cursor) {
  const { db } = cursor.options;
  const collectionName = cursor.ns.slice(db.databaseName.length + 1);
  return db.collection(collectionName);
}

const getPaginatedResponse = curry(async (xform, query, args) => {
  const { totalCount, pageInfo } = await applyPaginationToMongoQuery(query, args);

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
