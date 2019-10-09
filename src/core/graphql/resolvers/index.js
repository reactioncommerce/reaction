import { createRequire } from "module";
import ConnectionCursor from "./ConnectionCursor.js";
import ConnectionLimitInt from "./ConnectionLimitInt.js";
// import Currency from "./Currency.js";
// import Money from "./Money.js";

const require = createRequire(import.meta.url); // eslint-disable-line
const { GraphQLDate, GraphQLDateTime } = require("graphql-iso-date");

export default {
  ConnectionCursor,
  ConnectionLimitInt,
  // Currency,
  Date: GraphQLDate,
  DateTime: GraphQLDateTime,
  // Money,
  Mutation: {
    echo: (_, { str }) => `${str}`
  },
  Query: {
    ping: () => "pong"
  },
  Subscription: {
    tick: {
      subscribe: (_, __, context) => {
        let tickValue = 0;
        let intervalId = setInterval(() => {
          tickValue += 1;
          context.pubSub.publish("tick", { tick: tickValue });
          if (tickValue === 10) {
            clearInterval(intervalId);
            intervalId = null;
          }
        }, 1000);

        return context.pubSub.asyncIterator("tick");
      }
    }
  }
};
