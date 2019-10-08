import hasPermission from "./hasPermission.js";

test("returns false if no user", () => {
  const result = hasPermission(null, []);
  expect(result).toBe(false);
});

test("returns false if no user.roles", () => {
  const result = hasPermission({}, []);
  expect(result).toBe(false);
});

test("throws if permissions is not an array", () => {
  expect(() => hasPermission({ roles: {} })).toThrowErrorMatchingSnapshot();
});

test("throws if roleGroup is present but not a string", () => {
  expect(() => hasPermission({ roles: {} }, [], 123)).toThrowErrorMatchingSnapshot();
});

test("throws if roleGroup is present but an empty string", () => {
  expect(() => hasPermission({ roles: {} }, [], "")).toThrowErrorMatchingSnapshot();
});

test("returns true if in global role, even if not in group-scope role", () => {
  const result = hasPermission({
    roles: {
      __global_roles__: ["can_fry_bacon"], // eslint-disable-line camelcase
      scope: ["can_eat"]
    }
  }, ["can_fry_bacon", "can_scoop_ice_cream"], "scope");
  expect(result).toBe(true);
});

test("returns true if in group-scope role but not in global role", () => {
  const result = hasPermission({
    roles: {
      __global_roles__: ["can_fry_bacon"], // eslint-disable-line camelcase
      scope: ["can_eat"]
    }
  }, ["can_eat", "can_scoop_ice_cream"], "scope");
  expect(result).toBe(true);
});

test("returns true if in role in both scopes", () => {
  const result = hasPermission({
    roles: {
      __global_roles__: ["can_fry_bacon", "can_scoop_ice_cream"], // eslint-disable-line camelcase
      scope: ["can_eat", "can_scoop_ice_cream"]
    }
  }, ["can_scoop_ice_cream"], "scope");
  expect(result).toBe(true);
});

test("returns false if not in any role in either scope", () => {
  const result = hasPermission({
    roles: {
      __global_roles__: ["can_fry_bacon", "can_scoop_ice_cream"], // eslint-disable-line camelcase
      scope: ["can_eat", "can_scoop_ice_cream"]
    }
  }, ["can_do_dishes"], "scope");
  expect(result).toBe(false);
});

test("returns true if has owner role, even if not explicitly in the permissions array", () => {
  const result = hasPermission({
    roles: {
      __global_roles__: ["can_fry_bacon", "can_scoop_ice_cream"], // eslint-disable-line camelcase
      scope: ["can_eat", "can_scoop_ice_cream", "owner"]
    }
  }, ["can_do_dishes"], "scope");
  expect(result).toBe(true);
});
