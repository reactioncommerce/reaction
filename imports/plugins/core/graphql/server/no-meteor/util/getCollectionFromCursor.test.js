import getFakeMongoCursor from "@reactioncommerce/api-utils/tests/getFakeMongoCursor.js";
import getCollectionFromCursor from "./getCollectionFromCursor";

const mockCursor = getFakeMongoCursor("Accounts", []);

test("returns the collection instance", () => {
  mockCursor.options.db.collection.mockReturnValueOnce("fakeInstance");
  const result = getCollectionFromCursor(mockCursor);
  expect(result).toBe("fakeInstance");
  expect(mockCursor.options.db.collection).toHaveBeenCalledWith("Accounts");
});
