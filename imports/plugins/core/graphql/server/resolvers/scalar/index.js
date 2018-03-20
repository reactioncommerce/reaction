import { GraphQLDate, GraphQLTime, GraphQLDateTime } from "graphql-iso-date";
import ConnectionCursor from "./ConnectionCursor";

export default {
  ConnectionCursor,
  Date: GraphQLDate,
  DateTime: GraphQLDateTime,
  Time: GraphQLTime
};
