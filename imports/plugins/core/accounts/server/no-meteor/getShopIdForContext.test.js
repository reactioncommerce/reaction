import getShopIdForContext from "./getShopIdForContext";

const queries = {
  primaryShopId: () => "SHOP_ID_BY_DOMAIN"
};

test("falls back to primaryShopId if context has no user", async () => {
  const result = await getShopIdForContext({ queries });
  expect(result).toBe("SHOP_ID_BY_DOMAIN");
});

test("falls back to primaryShopId if context has user but not activeShopId prop", async () => {
  const result = await getShopIdForContext({ queries, user: { profile: {} } });
  expect(result).toBe("SHOP_ID_BY_DOMAIN");
});

test("uses context user's shop ID if present", async () => {
  const result = await getShopIdForContext({
    queries,
    user: {
      profile: {
        preferences: {
          reaction: {
            activeShopId: "ACTIVE_SHOP_ID"
          }
        }
      }
    }
  });
  expect(result).toBe("ACTIVE_SHOP_ID");
});
