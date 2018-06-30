import { makeExecutableSchema } from "graphql-tools";
import resolvers from "./resolvers";
import typeDefs from "./schemas";
import schemaDirectives from "./schemaDirectives";

export default makeExecutableSchema({ resolvers, schemaDirectives, typeDefs });
