/* eslint-disable id-length */

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

test("getCollection should return correct values", async () => {
  const collectionConfig = { name: "Test" };
  const mockCollection = {
    find: jest.fn().mockReturnValue({}),
    deleteOne: jest.fn().mockReturnValue({ deletedCount: 1, acknowledged: true }),
    updateMany: jest.fn().mockReturnValue({ modifiedCount: 2, acknowledged: true }),
    insertOne: jest.fn().mockReturnValue({ acknowledged: true }),
    findOneAndUpdate: jest.fn().mockReturnValue({ ok: 1, lastErrorObject: { n: 1 } }),
    replaceOne: jest.fn().mockReturnValue({ modifiedCount: 1, acknowledged: true }),
    updateOne: jest.fn().mockReturnValue({ modifiedCount: 1, acknowledged: true }),
    bulkWrite: jest.fn().mockReturnValue({
      result: {
        ok: 1,
        writeErrors: [],
        writeConcernErrors: [],
        nInserted: 1,
        nUpserted: 2,
        nMatched: 3,
        nModified: 4,
        nRemoved: 5
      }
    }),
    // eslint-disable-next-line id-length
    s: {
      db: jest.fn(),
      namespace: {
        db: "test_db",
        collection: "test_collection"
      }
    }
  };

  const api = new ReactionAPICore();

  api.db = {
    collection: () => ({ ...mockCollection }),
    command: jest.fn()
  };

  const collection = await api.getCollection(collectionConfig, {});
  api.applyMongoV3BackwardCompatible(collection);

  collection.find({});
  expect(mockCollection.find).toBeCalled();

  const deleteOneResult = await collection.deleteOne({});
  expect(mockCollection.deleteOne).toBeCalled();
  expect(deleteOneResult).toEqual({ ...deleteOneResult, result: { n: 1, ok: 1 } });

  const updateManyResult = await collection.updateMany({});
  expect(mockCollection.updateMany).toBeCalled();
  expect(updateManyResult).toEqual({ ...updateManyResult, result: { n: 2, ok: 1 } });

  const insertOneResult = await collection.insertOne({});
  expect(mockCollection.insertOne).toBeCalled();
  expect(insertOneResult).toEqual({ ...insertOneResult, result: { n: 1, ok: 1 } });

  const findOneAndUpdateResult = await collection.findOneAndUpdate({});
  expect(mockCollection.findOneAndUpdate).toBeCalled();
  expect(findOneAndUpdateResult).toEqual({ ...findOneAndUpdateResult, modifiedCount: 1 });

  const replaceOneResult = await collection.replaceOne({});
  expect(mockCollection.replaceOne).toBeCalled();
  expect(replaceOneResult).toEqual({ ...replaceOneResult, result: { n: 1, ok: 1 } });

  const updateOneResult = await collection.updateOne({});
  expect(mockCollection.updateOne).toBeCalled();
  expect(updateOneResult).toEqual({ ...updateOneResult, result: { n: 1, ok: 1 } });

  const bulkWriteResult = await collection.bulkWrite({});
  expect(mockCollection.updateOne).toBeCalled();
  expect(bulkWriteResult).toEqual({
    ...bulkWriteResult,
    nInserted: 1,
    nUpserted: 2,
    nMatched: 3,
    nModified: 4,
    nRemoved: 5,
    insertedCount: 1,
    upsertedCount: 2,
    matchedCount: 3,
    modifiedCount: 4,
    deletedCount: 5
  });
});
