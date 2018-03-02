import cors from "cors";
import { Meteor } from "meteor/meteor";
import { createApolloServer } from "./server";
import { makeExecutableSchema } from "graphql-tools";
import { resolvers } from "./resolvers";
import { typeDefs } from "./schemas";

const schema = makeExecutableSchema({ typeDefs, resolvers });

server = createApolloServer(
  { schema },
  {
    configServer(express) {
      express.use(cors());
    }
  }
);
