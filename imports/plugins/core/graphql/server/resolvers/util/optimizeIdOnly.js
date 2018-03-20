import graphqlFields from "graphql-fields";

export default function optimizeIdOnly(_id, info, queryFunc) {
  const topLevelFields = Object.keys(graphqlFields(info));

  // If only the _id was requested, we already have that. Save a DB call.
  if (topLevelFields.length === 1 && topLevelFields[0] === "_id") {
    return () => ({ _id: context.userId });
  }
  return queryFunc;
}
