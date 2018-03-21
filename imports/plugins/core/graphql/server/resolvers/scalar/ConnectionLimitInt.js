import { GraphQLScalarType } from "graphql";
import { Kind } from "graphql/language";

const MAX_LIMIT = 50;

/**
 * @name parseValue
 * @method
 * @summary Adjusts value to be between 1 and MAX_LIMIT, inclusive
 * @param {Number} value An integer provided by the client for the requested limit
 * @returns The adjusted integer value.
 */
function parseValue(value) {
  if (typeof value !== "number" || isNaN(value)) return MAX_LIMIT;
  return Math.min(Math.max(1, value), MAX_LIMIT);
}

export default new GraphQLScalarType({
  name: "ConnectionLimitInt",
  serialize: (value) => value,
  parseLiteral(ast) {
    if (ast.kind !== Kind.INT) return MAX_LIMIT;
    return parseValue(parseInt(ast.value, 10));
  },
  parseValue
});
