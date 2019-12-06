import hasPermission from "./hasPermission.js";

test("returns false if no user", async () => {
  const result = await hasPermission({ user: null }, "resource", "action", { shopId: "scope" });
  expect(result).toBe(false);
});

test("returns false if no user.roles", async () => {
  const result = await hasPermission({ user: { roles: null } }, "resource", "action", { shopId: "scope" });
  expect(result).toBe(false);
});

test("throws if no resource", async () => {
  const result = hasPermission(
    {
      user: {
        roles: {
          __global_roles__: ["can_fry_bacon"], // eslint-disable-line camelcase
          scope: ["can_eat"]
        }
      }
    },
    null,
    "action",
    { shopId: "scope" }
  );
  expect(result).rejects.toThrowErrorMatchingSnapshot();
});

test("throws if no action", async () => {
  const result = hasPermission(
    {
      user: {
        roles: {
          __global_roles__: ["can_fry_bacon"], // eslint-disable-line camelcase
          scope: ["can_eat"]
        }
      }
    },
    "resource",
    null,
    { shopId: "scope" }
  );
  expect(result).rejects.toThrowErrorMatchingSnapshot();
});

test("throws if no authContext", async () => {
  const result = hasPermission(
    {
      user: {
        roles: {
          __global_roles__: ["can_fry_bacon"], // eslint-disable-line camelcase
          scope: ["can_eat"]
        }
      }
    },
    "resource",
    "action",
    null
  );
  expect(result).rejects.toThrowErrorMatchingSnapshot();
});

test("throws if no authContext.shopId (referred to as `roleGroup`)", async () => {
  const result = hasPermission(
    {
      user: {
        roles: {
          __global_roles__: ["can_fry_bacon"], // eslint-disable-line camelcase
          scope: ["can_eat"]
        }
      }
    },
    "resource",
    "action",
    {
      shopId: null,
      legacyRoles: ["role1", "role2"]
    }
  );
  expect(result).rejects.toThrowErrorMatchingSnapshot();
});

test("throws if roleGroup is present but not a string", async () => {
  const result = hasPermission(
    {
      user: {
        roles: {
          __global_roles__: ["can_fry_bacon"], // eslint-disable-line camelcase
          scope: ["can_eat"]
        }
      }
    },
    "resource",
    "action",
    {
      shopId: ["thisIsNotAString"],
      legacyRoles: ["role1", "role2"]
    }
  );
  expect(result).rejects.toThrowErrorMatchingSnapshot();
});

test("throws if roleGroup is present but an empty string", async () => {
  const result = hasPermission(
    {
      user: {
        roles: {
          __global_roles__: ["can_fry_bacon"], // eslint-disable-line camelcase
          scope: ["can_eat"]
        }
      }
    },
    "resource",
    "action",
    {
      shopId: "",
      legacyRoles: ["role1", "role2"]
    }
  );
  expect(result).rejects.toThrowErrorMatchingSnapshot();
});

test("returns true if in global role, even if not in group-scope role", async () => {
  const result = await hasPermission(
    {
      user: {
        roles: {
          __global_roles__: ["can_fry_bacon"], // eslint-disable-line camelcase
          scope: ["can_eat"]
        }
      }
    },
    "resource",
    "action",
    {
      shopId: "SHOP_ID",
      legacyRoles: ["can_fry_bacon", "can_scoop_ice_cream"]
    }
  );
  expect(result).toBe(true);
});

test("returns true if in group-scope role but not in global role", async () => {
  const result = await hasPermission(
    {
      user: {
        roles: {
          __global_roles__: ["can_fry_bacon"], // eslint-disable-line camelcase
          scope: ["can_eat"]
        }
      }
    },
    "resource",
    "action",
    {
      shopId: "scope",
      legacyRoles: ["can_eat", "can_scoop_ice_cream"]
    }
  );
  expect(result).toBe(true);
});

test("returns true if in role in both scopes", async () => {
  const result = await hasPermission(
    {
      user: {
        roles: {
          __global_roles__: ["can_fry_bacon", "can_scoop_ice_cream"], // eslint-disable-line camelcase
          scope: ["can_eat", "can_scoop_ice_cream"]
        }
      }
    },
    "resource",
    "action",
    {
      shopId: "scope",
      legacyRoles: ["can_scoop_ice_cream"]
    }
  );
  expect(result).toBe(true);
});

test("returns false if not in any role in either scope", async () => {
  const result = await hasPermission(
    {
      user: {
        roles: {
          __global_roles__: ["can_fry_bacon", "can_scoop_ice_cream"], // eslint-disable-line camelcase
          scope: ["can_eat", "can_scoop_ice_cream"]
        }
      }
    },
    "resource",
    "action",
    {
      shopId: "scope",
      legacyRoles: ["can_do_dishes"]
    }
  );
  expect(result).toBe(false);
});

test("returns true if has owner role, even if not explicitly in the permissions array", async () => {
  const result = await hasPermission(
    {
      user: {
        roles: {
          __global_roles__: ["can_fry_bacon", "can_scoop_ice_cream"], // eslint-disable-line camelcase
          scope: ["can_eat", "can_scoop_ice_cream", "owner"]
        }
      }
    },
    "resource",
    "action",
    {
      shopId: "scope",
      legacyRoles: ["can_do_dishes"]
    }
  );
  expect(result).toBe(true);
});
