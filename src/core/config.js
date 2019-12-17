import envalid from "envalid";

const { bool, makeValidator, num, str } = envalid;

const bodyParserValidator = makeValidator((value) => {
  if (typeof value !== "number") throw new Error("Expected type number");
  if (value <= 0) throw new Error("Expected value to be greater than 0");
  return value;
});

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
  REACTION_GRAPHQL_SUBSCRIPTIONS_ENABLED: bool({
    default: true,
    desc: "Set this to false if you do not need GraphQL subscription support"
  }),
  REACTION_SHOULD_INIT_REPLICA_SET: bool({
    default: false,
    devDefault: true,
    desc: "Automatically initialize a replica set for the MongoDB instance. Set this to 'true' when running the app for development or tests."
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
