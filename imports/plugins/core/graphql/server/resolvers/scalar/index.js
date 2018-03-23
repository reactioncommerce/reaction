import { GraphQLDate, GraphQLTime, GraphQLDateTime } from "graphql-iso-date";
import ConnectionCursor from "./ConnectionCursor";
import ConnectionLimitInt from "./ConnectionLimitInt";

export default {
  ConnectionCursor,
  ConnectionLimitInt,
  Date: GraphQLDate,
  DateTime: GraphQLDateTime,
  Time: GraphQLTime
};
