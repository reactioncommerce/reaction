import shopsUserHasPermissionForLegacy from "./shopsUserHasPermissionFor.js";

const user = {
  roles: {
    abc: [
      "accounts",
      "orders"
    ],
    def: [
      "navigation",
      "orders"
    ]
  }
};

test("returns blank array if no user", () => {
  const result = shopsUserHasPermissionForLegacy(null, "orders");
  expect(result).toEqual([]);
});

test("returns blank array if no user.roles", () => {
  const result = shopsUserHasPermissionForLegacy({}, "orders");
  expect(result).toEqual([]);
});

test("returns blank array if no permission", () => {
  const result = shopsUserHasPermissionForLegacy(user, null);
  expect(result).toEqual([]);
});

test("returns an array of both shops for `orders` permission", () => {
  const result = shopsUserHasPermissionForLegacy(user, "orders");
  expect(result).toEqual(["abc", "def"]);
});

test("returns an array of shop `abc` for `accounts` permission", () => {
  const result = shopsUserHasPermissionForLegacy(user, "accounts");
  expect(result).toEqual(["abc"]);
});

test("returns an array of shop `def` for `navigation` permission", () => {
  const result = shopsUserHasPermissionForLegacy(user, "navigation");
  expect(result).toEqual(["def"]);
});

test("returns a blank array for `dogs` permission", () => {
  const result = shopsUserHasPermissionForLegacy(user, "dogs");
  expect(result).toEqual([]);
});
