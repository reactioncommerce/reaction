import getCollectionFromCursor from "./getCollectionFromCursor.js";
import getFakeMongoCursor from "./test-utils/getFakeMongoCursor.js";

const mockCursor = getFakeMongoCursor("Accounts", []);

test("returns the collection instance", () => {
  mockCursor.options.db.collection.mockReturnValueOnce("fakeInstance");
  const result = getCollectionFromCursor(mockCursor);
  expect(result).toBe("fakeInstance");
  expect(mockCursor.options.db.collection).toHaveBeenCalledWith("Accounts");
});
