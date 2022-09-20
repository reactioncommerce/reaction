import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import ReactionAPICore from "./ReactionAPICore.js";
import appEvents from "./util/appEvents.js";
import coreResolvers from "./graphql/resolvers/index.js";

const coreGraphQLSchema = importAsString("./graphql/schema.graphql");
const coreGraphQLSubscriptionSchema = importAsString("./graphql/subscription.graphql");

test("no options", () => {
  const api = new ReactionAPICore();
  expect(api.context.appVersion).toBe(api.version);
  expect(api.version).toBe(null);
  expect(api.collections).toEqual({});
  expect(api.functionsByType).toEqual({});
  expect(api.functionsByType).toEqual({});
  expect(Object.keys(api.graphQL.resolvers)).toEqual(Object.keys(coreResolvers));
  expect(api.graphQL.schemas).toEqual([coreGraphQLSchema, coreGraphQLSubscriptionSchema]);
  expect(api.hasSubscriptionsEnabled).toBe(true);
  expect(api.rootUrl).toBe("http://localhost:3000/");
  expect(api.context.rootUrl).toBe("http://localhost:3000/");
  expect(typeof api.context.getAbsoluteUrl).toBe("function");
  expect(api.registeredPlugins).toEqual({});
  expect(api.expressMiddleware).toEqual([]);
  expect(api.mongodb).not.toBe(undefined);
});

test("can pass version", () => {
  const api = new ReactionAPICore({
    version: "1"
  });
  expect(api.context.appVersion).toBe(api.version);
  expect(api.version).toBe("1");
});

test("can pass custom appEvents", () => {
  const customAppEvents = {
    async emit() {},
    on() {},
    stop() {},
    resume() {}
  };

  const api = new ReactionAPICore({ appEvents: customAppEvents });
  expect(api.context.appEvents).toEqual(customAppEvents);
});

test("can pass custom appEvents that is a class instance", () => {
  const api = new ReactionAPICore({ appEvents });
  expect(api.context.appEvents).toEqual(appEvents);
});

test("throws error if appEvents is missing any props", () => {
  try {
    const api = new ReactionAPICore({ appEvents: {} }); // eslint-disable-line no-unused-vars
    expect(api).toBe(undefined); // this line should not run
  } catch (error) {
    expect(error.message).toBe("appEvents is missing the following required function properties: emit, on, resume, stop");
  }
});
