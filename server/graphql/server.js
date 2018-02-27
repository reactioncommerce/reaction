import { GraphQLServer } from "graphql-yoga";
import { resolvers } from "./resolvers";
import { typeDefs } from "./schemas";

export const server = new GraphQLServer({ resolvers, typeDefs });
