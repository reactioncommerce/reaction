import { makeExecutableSchema } from "graphql-tools";
import resolvers from "./resolvers";
import typeDefs from "./schemas";

export default makeExecutableSchema({ typeDefs, resolvers });
