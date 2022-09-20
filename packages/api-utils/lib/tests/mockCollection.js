/**
 * @summary Returns a mock collection instance with the given name
 * @param {String} collectionName The collection name
 * @returns {Object} Mock collection instance
 */
export default function mockCollection(collectionName) {
  return {
    insert() {
      throw new Error("insert mongo method is deprecated, use insertOne or insertMany");
    },
    remove() {
      throw new Error("remove mongo method is deprecated, use deleteOne or deleteMany");
    },
    update() {
      throw new Error("update mongo method is deprecated, use updateOne or updateMany");
    },
    bulkWrite: jest.fn().mockName(`${collectionName}.bulkWrite`).mockReturnValue(Promise.resolve({
      nMatched: 1,
      nModified: 1,
      result: {
        writeErrors: []
      }
    })),
    deleteOne: jest.fn().mockName(`${collectionName}.deleteOne`).mockReturnValue(Promise.resolve({
      deletedCount: 1
    })),
    deleteMany: jest.fn().mockName(`${collectionName}.deleteMany`),
    find: jest
      .fn()
      .mockName(`${collectionName}.find`)
      .mockReturnThis(),
    findOne: jest.fn().mockName(`${collectionName}.findOne`),
    findOneAndDelete: jest.fn().mockName(`${collectionName}.findOneAndDelete`),
    findOneAndUpdate: jest.fn().mockName(`${collectionName}.findOneAndUpdate`),
    fetch: jest.fn().mockName(`${collectionName}.fetch`),
    insertOne: jest.fn().mockName(`${collectionName}.insertOne`),
    insertMany: jest.fn().mockName(`${collectionName}.insertMany`),
    toArray: jest.fn().mockName(`${collectionName}.toArray`),
    updateOne: jest.fn().mockName(`${collectionName}.updateOne`).mockReturnValue(Promise.resolve({
      matchedCount: 1,
      modifiedCount: 1
    })),
    updateMany: jest.fn().mockName(`${collectionName}.updateMany`)
  };
}
