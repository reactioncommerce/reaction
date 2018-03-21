import { GraphQLScalarType } from "graphql";
import { Kind } from "graphql/language";

const toCursor = (value) => (value ? Buffer.from(value).toString("base64") : null);
const fromCursor = (cursor) => (cursor ? Buffer.from(cursor, "base64").toString("utf8") : null);

export default new GraphQLScalarType({
  name: "ConnectionCursor",
  serialize: toCursor,
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) return fromCursor(ast.value);
    return null;
  },
  parseValue: fromCursor
});
