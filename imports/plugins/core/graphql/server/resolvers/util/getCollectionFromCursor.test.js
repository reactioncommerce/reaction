import getCollectionFromCursor from "./getCollectionFromCursor";

const mockCursor = {
  options: {
    db: {
      databaseName: "meteor",
      collection: jest.fn().mockName("db.collection")
    }
  },
  ns: "meteor.Accounts"
};

test("returns the collection instance", () => {
  mockCursor.options.db.collection.mockReturnValueOnce("fakeInstance");
  const result = getCollectionFromCursor(mockCursor);
  expect(result).toBe("fakeInstance");
  expect(mockCursor.options.db.collection).toHaveBeenCalledWith("Accounts");
});
