import envalid from "envalid";
import dotenv from "dotenv";

dotenv.config();

const { bool, makeValidator, num, str } = envalid;

const bodyParserValidator = makeValidator((value) => {
  if (typeof value !== "number") throw new Error("Expected type number");
  if (value <= 0) throw new Error("Expected value to be greater than 0");
  return value;
});

// If you change this, update the "Supported Environment Variables" section in README
export default envalid.cleanEnv(process.env, {
  BODY_PARSER_SIZE_LIMIT: bodyParserValidator({
    default: 5 * 1000000 // value in bytes = 5mb
  }),
  GRAPHQL_INTROSPECTION_ENABLED: bool({ default: false, devDefault: true }),
  GRAPHQL_PLAYGROUND_ENABLED: bool({ default: false, devDefault: true }),
  MONGO_URL: str({
    devDefault: "mongodb://localhost:27017/reaction",
    desc: "A valid MongoDB connection string URI, ending with the database name",
    example: "mongodb://localhost:27017/reaction"
  }),
  MONGO_USE_UNIFIED_TOPOLOGY: bool({
    default: true,
    desc: "MongoDB's useUnifiedTopology connection option"
  }),
  PORT: num({
    default: 3000,
    desc: "The port on which the API server should listen",
    example: "8000"
  }),
  REACTION_LOG_LEVEL: str({
    choices: ["FATAL", "ERROR", "WARN", "INFO", "DEBUG", "TRACE"],
    default: "WARN",
    devDefault: "DEBUG",
    desc: "Determines how much logging you see. The options, from least to most logging, are FATAL, ERROR, WARN, INFO, DEBUG, TRACE. See: https://github.com/trentm/node-bunyan#levels",
    example: "ERROR"
  }),
  REACTION_APOLLO_FEDERATION_ENABLED: bool({
    default: false,
    desc: "Set this to true if you need Apollo Federation support."
  }),
  REACTION_GRAPHQL_SUBSCRIPTIONS_ENABLED: bool({
    default: true,
    desc: "Set this to false if you do not need GraphQL subscription support"
  }),
  REACTION_SHOULD_INIT_REPLICA_SET: bool({
    default: false,
    devDefault: true,
    desc: "Automatically initialize a replica set for the MongoDB instance. Set this to 'true' when running the app for development or tests."
  }),
  REDIS_PUB_SUB_URL: str({
    default: undefined,
    desc: "Redis Pub/Sub connection url",
    example: "redis://username:password@127.0.0.1:6379/0"
  }),
  REDIS_PUB_SUB_HOST: str({
    default: undefined,
    desc: "Redis Pub/Sub host",
    example: "localhost"
  }),
  REDIS_PUB_SUB_PORT: num({
    default: 6379,
    desc: "Redis Pub/Sub port",
    example: "6379"
  }),
  REDIS_PUB_SUB_USERNAME: str({
    default: undefined,
    desc: "Redis Pub/Sub username",
    example: "redis"
  }),
  REDIS_PUB_SUB_PASSWORD: str({
    default: undefined,
    desc: "Redis Pub/Sub password",
    example: "password"
  }),
  REDIS_PUB_SUB_DB: num({
    default: 0,
    desc: "Redis Pub/Sub database"
  }),
  ROOT_URL: str({
    devDefault: "http://localhost:3000",
    desc: "The protocol, domain, and port portion of the URL, to which relative paths will be appended. " +
      "This is used when full URLs are generated for things such as emails and notifications, so it must be publicly accessible.",
    example: "https://shop.mydomain.com"
  })
}, {
  dotEnvPath: null
});
