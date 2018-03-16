import { decodeOpaqueId } from "../../xforms/id";
import viewer from "./viewer";

const encodedUserId = "cmVhY3Rpb24vYWNjb3VudDoxMjM=";
const fakeUser = {
  _id: "123",
  name: "Reaction"
};

jest.mock("/lib/collections", () => ({
  Accounts: {
    findOne() {
      return {
        _id: "123",
        name: "Reaction"
      };
    }
  }
}));

jest.mock("/lib/api", () => ({
  Reaction: {
    hasPermission() {
      return false;
    }
  }
}));


test("returns the user ID of the viewing user", () => {
  const user = viewer(null, null, { user: { _id: "123" } });

  expect(encodedUserId).toBe(user._id);
});

test("returns and decodes the user ID of the viewing user", () => {
  const user = viewer(null, null, { user: { _id: "123" } });
  const { id } = decodeOpaqueId(user._id);

  expect(fakeUser._id).toBe(id);
});
